from django.shortcuts import redirect
from rest_framework import viewsets, permissions, status 
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import User, Song, Artist, Genre, UserSongPreference, UserArtistPreference, UserGenrePreference, Match, MatchRejection
from .serializers import UserSerializer, SongSerializer
from .permissions import IsSelfOrReadOnly
from rest_framework.decorators import action, api_view, permission_classes 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.http import JsonResponse, HttpResponseRedirect
import base64
import requests
import os 
from django.db import transaction, models
from dotenv import load_dotenv
from .matching_utils import compute_genre_similarity
import urllib.parse
from chat.models import Conversation
class UserViewSet(viewsets.ModelViewSet):
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]  # anyone can create a user (signup)
        else:
            return [permissions.IsAuthenticated(), IsSelfOrReadOnly()]
        
    # Override create to return token immediately
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate token
        token, _ = Token.objects.get_or_create(user=user)

        data = serializer.data
        data['token'] = token.key
        return Response(data, status=status.HTTP_201_CREATED)

    #get current user 
    def get_object(self):
        # for update/patch actions, only return the logged-in user
        if self.action in ['update', 'partial_update', 'destroy', 'retrieve'] and self.request.user.is_authenticated:
            # return request.user (this prevents updating other users)
            return self.request.user
        return super().get_object()
    
    def get_queryset(self):
        # For list action, only allow admin users
        if self.action == 'list':
            if self.request.user.is_staff:
                return User.objects.all()
            else:
                return User.objects.filter(id=self.request.user.id)
        return User.objects.all()
    


    #to get and update the logged in user data 
    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        

    # views.py - Replace your UserViewSet profile action
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """
        Returns the authenticated user's favorite songs, artists, and genres with weights
        """
        user = request.user
        
        serializer = self.get_serializer(request.user)
        # Get favorite songs with weights (sorted by weight)
        song_preferences = UserSongPreference.objects.filter(user=user).select_related('song').prefetch_related('song__artists', 'song__genres').order_by('-weight')
        favorite_songs = []
        for pref in song_preferences:
            song = pref.song
            #if song doesn't have an embed search for it 
            if not song.embed:
                song.embed = get_song_embed(song.spotify_url)
            
            song.save() 

            favorite_songs.append({
                'id': song.id,
                'name': song.name,
                'spotify_id': song.spotify_id,
                'album': song.album,
                'album_image_url': song.album_image_url,
                'spotify_url': song.spotify_url,
                'popularity': song.popularity,
                'duration_ms': song.duration_ms,
                'preview_url': song.preview_url,
                'artists': [{'id': a.id, 'name': a.name, 'spotify_id': a.spotify_id, 'image_url': a.image_url} for a in song.artists.all()],
                'genres': [{'id': g.id, 'name': g.name} for g in song.genres.all()],
                'weight': pref.weight,
                'embed': song.embed
            })
        
        # Get favorite artists with weights (sorted by weight)
        artist_preferences = UserArtistPreference.objects.filter(user=user).select_related('artist').prefetch_related('artist__genres').order_by('-weight')
        favorite_artists = []
        for pref in artist_preferences:
            artist = pref.artist
            favorite_artists.append({
                'id': artist.id,
                'name': artist.name,
                'spotify_id': artist.spotify_id,
                'image_url': artist.image_url,
                'popularity': artist.popularity,
                'genres': [{'id': g.id, 'name': g.name} for g in artist.genres.all()],
                'weight': pref.weight
            })
        
        # Get favorite genres with weights (sorted by weight)
        genre_preferences = UserGenrePreference.objects.filter(user=user).select_related('genre').order_by('-weight')
        favorite_genres = []
        for pref in genre_preferences:
            genre = pref.genre
            favorite_genres.append({
                'id': genre.id,
                'name': genre.name,
                'weight': pref.weight
            })
        
        return Response({
            'user': serializer.data,
            'favorite_songs': favorite_songs,
            'favorite_artists': favorite_artists,
            'favorite_genres': favorite_genres,
            'stats': {
                'total_songs': len(favorite_songs),
                'total_artists': len(favorite_artists),
                'total_genres': len(favorite_genres)
            }
        })
        



class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return songs favorited by the logged-in user
        """
        user = self.request.user
        return Song.objects.filter(favorited_by=user).prefetch_related('artists', 'genres').order_by('name')
    
    def list(self, request, *args, **kwargs):
        """
        List all songs favorited by the authenticated user with full details
        """
        queryset = self.get_queryset()
        
        # Get user's song preferences to include weights
        user_song_prefs = {
            pref.song_id: pref.weight 
            for pref in UserSongPreference.objects.filter(user=request.user)
        }
        
        # Use serializer for consistent formatting
        serializer = self.get_serializer(queryset, many=True)
        
        # Add weights to each song
        songs_data = []
        for song_dict in serializer.data:
            # Create a new dictionary to avoid modifying read-only serializer data
            song_with_weight = dict(song_dict)
            song_with_weight['weight'] = user_song_prefs.get(song_dict['id'], 5)
            songs_data.append(song_with_weight)
        
        # Sort by weight (highest first)
        songs_data.sort(key=lambda x: x['weight'], reverse=True)
        
        return Response(songs_data)
    
    def create(self, request, *args, **kwargs):
        """
        Add a song to user's favorites
        Expects: { "spotify_id": "abc123", "weight": 5 }
        """
        spotify_id = request.data.get('spotify_id')
        weight = request.data.get('weight', 5)
        
        if not spotify_id:
            return Response(
                {"error": "spotify_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if song exists in database
        try:
            song = Song.objects.get(spotify_id=spotify_id)
        except Song.DoesNotExist:
            # Song doesn't exist, fetch from Spotify and create it
            load_dotenv()
            client_id = os.getenv('CLIENT_ID')
            client_secret = os.getenv('CLIENT_SECRET')
            
            if not client_id or not client_secret:
                return Response(
                    {"error": "Spotify credentials not configured"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            token = get_spotify_token(client_id, client_secret)
            
            # Fetch song details from Spotify
            response = requests.get(
                f"https://api.spotify.com/v1/tracks/{spotify_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                return Response(
                    {"error": "Failed to fetch song from Spotify"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            song_data = response.json()
            
            # Create the song
            song = Song.objects.create(
                spotify_id=song_data['id'],
                name=song_data['name'],
                album=song_data.get('album', {}).get('name', ''),
                album_image_url=song_data.get('album', {}).get('images', [{}])[0].get('url', '') if song_data.get('album', {}).get('images') else '',
                popularity=song_data.get('popularity', 0),
                duration_ms=song_data.get('duration_ms'),
                preview_url=song_data.get('preview_url', ''),
                spotify_url=song_data.get('external_urls', {}).get('spotify', '')
            )
            
            embed = get_song_embed(song.spotify_url)
            song.embed = embed
            song.save() 
            
            # Add artists to the song
            for artist_data in song_data.get('artists', []):
                artist, _ = Artist.objects.get_or_create(
                    spotify_id=artist_data['id'],
                    defaults={
                        'name': artist_data['name'],
                        'image_url': '',
                        'popularity': 0,
                    }
                )
                song.artists.add(artist)
        
        # Check if user already has this song
        if UserSongPreference.objects.filter(user=request.user, song=song).exists():
            return Response(
                {"error": "Song already in your favorites"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the user preference
        UserSongPreference.objects.create(
            user=request.user,
            song=song,
            weight=weight
        )
        
        # Return the created song with weight
        serializer = self.get_serializer(song)
        response_data = serializer.data
        response_data['weight'] = weight
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """
        Remove a song from user's favorites
        """
        song = self.get_object()
        
        # Delete the user preference (not the song itself)
        UserSongPreference.objects.filter(user=request.user, song=song).delete()
        
        return Response(
            {"message": "Song removed from favorites"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['patch'])
    def update_weight(self, request, pk=None):
        """
        Update the weight of a song in user's favorites
        PATCH /api/songs/{id}/update_weight/
        Body: { "weight": 8 }
        """
        song = self.get_object()
        weight = request.data.get('weight')
        
        if weight is None:
            return Response(
                {"error": "weight is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not (1 <= weight <= 10):
            return Response(
                {"error": "weight must be between 1 and 10"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the preference
        pref = UserSongPreference.objects.get(user=request.user, song=song)
        pref.weight = weight
        pref.save()
        
        serializer = self.get_serializer(song)
        response_data = serializer.data
        response_data['weight'] = weight
        
        return Response(response_data)




#TODO: store the token and refresh every hour instead of making a request everytime
def get_spotify_token(client_id, client_secret):
    auth_string = f"{client_id}:{client_secret}"
    auth_base64 = base64.b64encode(auth_string.encode()).decode()

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Authorization": f"Basic {auth_base64}"},
        data={"grant_type": "client_credentials"}
    )

    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        raise Exception("Token retrieval failed:", response.text)

#return list of songs from spotify based on query

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def song_search(request):
    
    load_dotenv() 

    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    
    
    if not client_secret or not client_id:
        return Response({"detail": "Client Secret and Client ID not received from environment" }, status= status.HTTP_503_SERVICE_UNAVAILABLE)
    
    token = get_spotify_token(client_id, client_secret)
    
    if(token):
        query = request.GET.get('query', None)
        
        if not query :
            return Response("Must Input A Song Query", status= status.HTTP_400_BAD_REQUEST)
        
        url = "https://api.spotify.com/v1/search"
        params = {
            'q': query,
            'type': 'track',
            'limit': 3,
            # 'market': 'ES',
            # 'offset':0,
        }
        header = {
            'Authorization': f'Bearer {token}'
        }
        
        response = requests.get(url, headers=header, params=params)
        
         
    if response.status_code != 200:
        return Response(
            {"error": "Failed to search Spotify", "details": response.text},
            status=status.HTTP_502_BAD_GATEWAY
        )
    
    data = response.json()
    
    if not data.get('tracks') or not data['tracks'].get('items'):
        return Response({
            'count': 0,
            'songs': []
        })
    
    # Format songs to match your model structure
    songs = []
    for track in data['tracks']['items']:
        # Check if song already exists in database and if user has it
        user_has_song = False
        song_weight = 0
        
        try:
            existing_song = Song.objects.get(spotify_id=track['id'])
            pref = UserSongPreference.objects.filter(
                user=request.user, 
                song=existing_song
            ).first()
            if pref:
                user_has_song = True
                song_weight = pref.weight
        except Song.DoesNotExist:
            pass
        
        songs.append({
            'spotify_id': track['id'],
            'name': track['name'],
            'album': track.get('album', {}).get('name', ''),
            'album_image_url': track.get('album', {}).get('images', [{}])[0].get('url', '') if track.get('album', {}).get('images') else '',
            'spotify_url': track.get('external_urls', {}).get('spotify', ''),
            'preview_url': track.get('preview_url', ''),
            'duration_ms': track.get('duration_ms'),
            'popularity': track.get('popularity', 0),
            'artists': [
                {
                    'spotify_id': artist['id'],
                    'name': artist['name'],
                    'spotify_url': artist.get('external_urls', {}).get('spotify', '')
                }
                for artist in track.get('artists', [])
            ],
            'in_favorites': user_has_song,  # NEW: tells frontend if user already has this song
            'weight': song_weight  # NEW: the weight if they have it
        })
    
    return Response({
        'count': len(songs),
        'songs': songs
    })



@api_view(['GET'])
def spotify_login(request):

    load_dotenv() 
    # Spotify OAuth URL
    spotify_auth_url = "https://accounts.spotify.com/authorize"

    params = {
        "client_id": os.getenv('CLIENT_ID'), 
        "response_type": "code",
        "redirect_uri": os.getenv('SPOTIFY_REDIRECT_URI'), #when testing it's localhost 
        "scope": "user-read-email user-read-private user-top-read",   # Add other scopes as needed
      #  "state": "random_csrf_string_or_user_id",       # Optional but recommended
    }

    url = f"{spotify_auth_url}?{urllib.parse.urlencode(params)}"
    return redirect(url)  # Sends a 302 redirect to Spotify


@api_view(['GET'])
def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        return JsonResponse({"error": error}, status=400)

    # exchange code for access + refresh token
    token_url = 'https://accounts.spotify.com/api/token'
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.getenv('SPOTIFY_REDIRECT_URI'),
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
    }
    token_response = requests.post(token_url, data=payload)
    token_data = token_response.json()

    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    expires_in = token_data.get('expires_in')
    token_type = token_data.get('token_type')
    scope = token_data.get('scope')

    if not access_token:
        return JsonResponse({"error": "Failed to retrieve Spotify token"}, status=400)
    
    # use access token to get Spotify user's profile info
    user_profile_response = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if user_profile_response.status_code != 200:
        return JsonResponse({
            "error": f"Failed to fetch user profile from Spotify",
            "status_code": user_profile_response.status_code,
            "response": user_profile_response.text
        }, status=400)
    
    try:
        spotify_user = user_profile_response.json()
    except requests.exceptions.JSONDecodeError:
        return JsonResponse({
            "error": "Invalid JSON response from Spotify",
            "response_text": user_profile_response.text
        }, status=400)

    # spotify_user contains: id, email, display_name, images...
    spotify_id = spotify_user.get('id')
    email = spotify_user.get('email')   # Need 'user-read-email' scope
    username = spotify_user.get('display_name') or f"spotify_{spotify_id}"

    # Create or get User
    user, created = User.objects.get_or_create(
        username=spotify_id,
        defaults={
            "email": email,
            "first_name": username or "",
        }
    )

    # Store Spotify credentials for that user
    from .models import SpotifyCredentials
    SpotifyCredentials.objects.update_or_create(
        user=user,
        defaults={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "token_type": token_type,
            "scope": scope,
        }
    )

    #if new user was created initialize their spotify fav songs and stuff 
    if(created):
        user_credentials= SpotifyCredentials.objects.get(user=user)

        time_frame = 'medium_term'

        #the fav songs will contain the artists, genres, and songs info 
        fav_songs = get_spotify_users_fav_songs(user_credentials, time_frame=time_frame); #get fav songs from spotify
        if fav_songs is None: 
             return JsonResponse({
            "error": "Favorite song response from Spotify",
            "response_text": user_profile_response.text
        }, status =417) 

        fav_artists  = get_spotify_user_fav_artists(user_credentials, time_frame=time_frame) 
        if fav_artists is None: 
             return JsonResponse({
            "error": "Favorite artist response from Spotify",
            "response_text": user_profile_response.text
        }, status =417) 
        
        #tranlate the list of objects into the correct models and save for the user 
        translate_spotify_songs(user, fav_songs)
        translate_spotify_artist_and_genres(user, fav_artists)
    
    
    # Create DRF token for authentication with your API
    auth_token, _ = Token.objects.get_or_create(user=user)

    # Send user back to frontend with token (or store in session)
    frontend_url_base = os.getenv('FRONTEND_URL_BASE')
    frontend_redirect = f"{frontend_url_base}/login?token={auth_token.key}"
    print("Redirect: " ,frontend_redirect)
    return redirect(frontend_redirect)

#taked in the spotify url of the songs and get the embed in form of json 
def get_song_embed( url):
    response = requests.get(
        f'https://open.spotify.com/oembed?url={url}'
    )

    if response.status_code != 200:
        return {}
    
    embed =  response.json();
    return embed 
    
     

@transaction.atomic #if something fails roll back everything
def translate_spotify_songs(user,fav_songs):
    for idx, song_data in enumerate(fav_songs):
        
        # based on the song's name get the embed for it
        spotify_url = song_data.get('external_urls').get('spotify') if  song_data.get('external_urls') else ''
        song_embed = get_song_embed (spotify_url) 

        # get or create the song
        song, created = Song.objects.get_or_create(
            spotify_id=song_data['id'],
            defaults={
                'name': song_data['name'],
                'album': song_data.get('album', {}).get('name', ''),
                'album_image_url': song_data.get('album', {}).get('images', [{}])[0].get('url', '') if song_data.get('album', {}).get('images') else '',
                'popularity': song_data.get('popularity', 0),
                'duration_ms': song_data.get('duration_ms'),
                'preview_url': song_data.get('preview_url', ''),
                "spotify_url": spotify_url, 
                'embed' : song_embed
            }
        )
        
        # Link all artists to this song
        for artist_data in song_data.get('artists', []):
            artist, _ = Artist.objects.get_or_create(
                spotify_id=artist_data['id'],
                defaults={ # all lot of the values will get overidden in next api call 
                    'name': artist_data['name'],
                    'image_url': '', 
                    'popularity': 0,
                }
            )
            # add artist to song
            song.artists.add(artist)

        
        # Create user preference with weight based on ranking
        weight = max(1, 10 - idx)  
        UserSongPreference.objects.update_or_create(
            user=user,
            song=song,  # Fixed: was 'artist=song'
            defaults={'weight': weight}
        )

@transaction.atomic #if something fails roll back everything
def translate_spotify_artist_and_genres(user, fav_artists)   :
    
    #the genres that appear the most will have the most weight 
    genre_weights = {}
    
    for idx, artist_data in enumerate(fav_artists):
        # Create or get artist
        artist, created = Artist.objects.get_or_create(
            spotify_id=artist_data['id'],
            defaults={
                'name': artist_data['name'],
                'image_url': artist_data.get('images', [{}])[0].get('url', '') if artist_data.get('images') else '',
                'popularity': artist_data.get('popularity', 0)
            }
        )

        # Create artist preference
        weight = max(1, 10 - idx)
        UserArtistPreference.objects.update_or_create(
            user=user,
            artist=artist,
            defaults={'weight': weight}
        )

        #if the genre hasn't been seen before start w/ one otherwise increment 
        for genre_name in artist_data.get('genres', []):
            genre_weights[genre_name] = genre_weights.get(genre_name, 0) + 1
            
            # create and link to artist 
            genre, _ = Genre.objects.get_or_create(name=genre_name)
            artist.genres.add(genre)
    
    # create genre prefernces based on the amount of times they appeared  
    for genre_name, count in genre_weights.items():
        genre, _ = Genre.objects.get_or_create(name=genre_name)
        
        weight = min(10, count)  # Cap at 10
        
        UserGenrePreference.objects.update_or_create(
            user=user,
            genre=genre,
            defaults={'weight': weight}
        )

#returns a list of users top songs 
def get_spotify_users_fav_songs(spotify_credentials, time_frame='medium_term'):
    
    user_top_songs_response = requests.get(
        f'https://api.spotify.com/v1/me/top/tracks?offset=0&time_range={time_frame}',
        headers={"Authorization": f"Bearer {spotify_credentials.access_token}"}
    )

    if user_top_songs_response.status_code != 200:
        print("Error when retrieving user's top songs: ", user_top_songs_response.text)
        return None 

    response_json = user_top_songs_response.json()

    return response_json.get('items',[])  



def get_spotify_user_fav_artists(spotify_credentials, time_frame='medium_term'):
    
    user_top_artist_genres_response = requests.get(
        f'https://api.spotify.com/v1/me/top/artists?offset=0&time_range={time_frame}',
        headers={"Authorization": f"Bearer {spotify_credentials.access_token}"}
    )

    if user_top_artist_genres_response.status_code != 200:
        print("Error when retrieving user's top artists and genres: ", user_top_artist_genres_response.text)
        return None 

    response_json = user_top_artist_genres_response.json() 
    return  response_json.get('items', [])


#TODO update user matching functionality
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matches(request):
  
    #TEMP 
    # get all users barring this current one , for each build a match with the current user  
    current_user = request.user

    # Get IDs where current_user is either user1 or user2
    matched_pairs = Match.objects.filter(
        models.Q(user1=current_user) | models.Q(user2=current_user)
    ).values_list('user1', 'user2')

    # Flatten list of (user1, user2) tuples into a single set of IDs
    matched_user_ids = {uid for pair in matched_pairs for uid in pair}

    # IDs of users already rejected
    rejected_user_ids = set(
        MatchRejection.objects.filter(user1=current_user).values_list('user2', flat=True)
    )

    # Combine all excluded user IDs + current user
    excluded_ids = matched_user_ids | rejected_user_ids | {current_user.id}

    # Get all users not yet matched/rejected
    all_users = User.objects.exclude(id__in=excluded_ids)

    #only show users who haven't already been accepted/rejected 

    matches_profiles = []
    for user in all_users:

        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'location': user.location,
            'age': user.age,
            'biography': user.biography,
            'interests': user.interests,
            'profile_image': user.profile_image.url if user.profile_image else None,
        }

        
        favorite_song_prefs = UserSongPreference.objects.filter(user=user).select_related('song').order_by('-weight').values(
                'song__id', 'song__name', 'song__spotify_id', 
                'song__album_image_url', 'weight'
            )[:3]
        
        fav_songs = [
            {
                'id': s['song__id'],
                'name': s['song__name'],
                'spotify_id': s['song__spotify_id'],
                'album_image_url': s['song__album_image_url'],
                'weight': s['weight'],
            }
            for s in favorite_song_prefs
        ]

        favorite_artists_prefs = UserArtistPreference.objects.filter(user=user) \
            .select_related('artist').order_by('-weight') \
            .values(
                'artist__id', 'artist__name', 'artist__spotify_id', 
                'artist__image_url', 'weight'
            )[:3]

        fav_artists = [
            {
                'id': a['artist__id'],
                'name': a['artist__name'],
                'spotify_id': a['artist__spotify_id'],
                'image_url': a['artist__image_url'],
                'weight': a['weight'],
            }
            for a in favorite_artists_prefs
        ]

        profile_data['fav_songs'] = fav_songs
        profile_data['fav_artists'] = fav_artists

        matches_profiles.append(profile_data)

    return Response({
        'count': len(matches_profiles),
        'matches':matches_profiles
    })


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def match_accept(request):
    if request.method =='GET' :
        matched_users =  Match.objects.filter(models.Q(user1=request.user) |
        models.Q(user1=request.user))
    
        matches_data = [
            {
                "id": match.id,
                "user1_id": match.user1.id,
                "user1_username": match.user1.username,
                "user2_id": match.user2.id,
                "user2_username": match.user2.username,
                "created_at": match.created_at,
            }
            for match in matched_users 
        ]

        return Response(matches_data)
        
    # POST logic starts here
    current_user = request.user
    target_user_id = request.data.get('id')

    if not target_user_id:
        return Response({'error': 'user id is required'}, status=400)

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # Use a transaction to ensure both Match and Conversation are created atomically
    with transaction.atomic():
        # Check if the match already exists (using a query)
        match_query = Match.objects.filter(
            models.Q(user1=current_user, user2=target_user) |
            models.Q(user1=target_user, user2=current_user)
        )

        if not match_query.exists():
            # 1. Create the Match object and save it to a variable
            new_match = Match.objects.create(user1=current_user, user2=target_user)

            # 2. Create the corresponding Conversation object,
            #    linking it via the 'match' field as defined in chat/models.py
            Conversation.objects.create(match=new_match) 

    return Response({'message': f'Match created with {target_user.username}'}, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def match_reject(request):
    current_user = request.user
    data = request.data
    target_user_id = data.get('id') 

    if not target_user_id:
        return Response({'error': 'User id missing from request'}, status=400)

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # Prevent duplicates
    if not MatchRejection.objects.filter(user1=current_user, user2=target_user).exists():
        MatchRejection.objects.create(user1=current_user, user2=target_user)

    return Response({'message': f'You rejected {target_user.username}'}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def return_accepted_matches(request)    :
    accepted_users = Match.objects.filter(user1 = request.user)
    
    return Response({
        'accepted': accepted_users
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_genre_based_matches(request):
    user = request.user
    other_users = User.objects.exclude(id=user.id)

    matches = []
    for other in other_users:
        similarity = compute_genre_similarity(user, other)
        if similarity > 0.3:  # threshold
            matches.append({
                'id': other.id,
                'username': other.username,
                'similarity': similarity,
            })

    matches.sort(key=lambda x: x['similarity'], reverse=True)
    return Response({'matches': matches})
