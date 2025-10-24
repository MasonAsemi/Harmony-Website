
from rest_framework import viewsets, permissions, status 
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import User
from .serializers import UserSerializer
from .permissions import IsSelfOrReadOnly
from rest_framework.decorators import action, api_view, permission_classes 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
import base64
import requests
import os 
from dotenv import load_dotenv

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
        return Response({"detail": "forehead" }, status= status.HTTP_503_SERVICE_UNAVAILABLE)
    
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
            songs = []
            
            if data['tracks'] and data['tracks']['items'] and data['tracks']['items']:
                

                for song in data['tracks']['items']:
                    song_link = song['external_urls']
                    song_name= song['name'] 
                    list_of_artists =[]
                    for artist in song['artists']:
                        list_of_artists.append({
                            'name': artist['name'],
                            'links': artist['external_urls']
                        })
                    
                    return Response({
                        'list_of_artists': list_of_artists,
                        'song_link': song_link,
                        'song_name': song_name,
                    })

            else: 
                return Response({"detail": "Returned data wasn't in correct format"}, status=status.HTTP_417_EXPECTATION_FAILED)
                
        else:
            return Response({"Track Retrieval error: ", response.text})
    else:
        return Response({"message: ", "Failed to retrieve token from spotify. Couldn't process search request"}, status=status.HTTP_417_EXPECTATION_FAILED)