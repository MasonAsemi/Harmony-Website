from django.shortcuts import redirect
from rest_framework import viewsets, permissions, status 
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import User, Song, Artist, Genre, UserSongPreference, UserArtistPreference, UserGenrePreference
from .serializers import UserSerializer, SongSerializer
from .permissions import IsSelfOrReadOnly
from rest_framework.decorators import action, api_view, permission_classes 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.http import JsonResponse, HttpResponseRedirect
import base64
import requests
import os 
from django.db import transaction 
from dotenv import load_dotenv
import urllib.parse
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
        



class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return songs belonging to the logged-in user
        return Song.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach the user to the song
        serializer.save(user=self.request.user)



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
        
        if response.status_code == 200  :
            #TODO: format the response into song data type 
            data = response.json()
            
            if data['tracks'] and data['tracks']['items'] and data['tracks']['items']:
                
                songs = []
                for song in data['tracks']['items']:
                    song_link = song['external_urls']
                    song_name= song['name'] 
                    list_of_artists =[]
                    for artist in song['artists']:
                        list_of_artists.append({
                            'name': artist['name'],
                            'links': artist['external_urls']
                        })
                    
                    songs.append({
                        'list_of_artists': list_of_artists,
                        'link': song_link,
                        'name': song_name,
                    })
                return Response({
                    'songs': songs
                })
            else: 
                return Response({"detail": "Returned data wasn't in correct format"}, status=status.HTTP_417_EXPECTATION_FAILED)
                
        else:
            return Response({"Track Retrieval error: ", response.text})
    else:
        return Response({"message: ", "Failed to retrieve token from spotify. Couldn't process search request"}, status=status.HTTP_417_EXPECTATION_FAILED)


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
    frontend_redirect = f"https://harmonymatching.com/login?token={auth_token.key}"
    return redirect(frontend_redirect)


@transaction.atomic #if something fails roll back everything
def translate_spotify_songs(user,fav_songs):
    for idx, song_data in enumerate(fav_songs):
        
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
                "spotify_url": song_data.get('external_urls').get('spotify') if  song_data.get('external_urls') else ''
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


