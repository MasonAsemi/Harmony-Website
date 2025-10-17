#run code for any api whenever it gets called 
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view 
from rest_framework.response import Response # generate json responses 
from .serializers import UserSerializer , RegisterSerializer, LoginSerializer, TokenResponseSerializer
from rest_framework import status 
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
#We want to be able to pass in an authtoken and get a respective user 
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated

#LOGIN
@swagger_auto_schema(
    method='post',
    request_body=LoginSerializer,
    responses={
        200: TokenResponseSerializer,
        404: 'Unauthorized - user not found'
    },
    operation_description="Login with username and password to receive authentication token"
)
@api_view(['POST'])
def login(request):

    user = get_object_or_404(User, username=request.data['username'])
    
    if not user.check_password(request.data['password']):
        return Response({"detail": "Not Found."}, status=status.HTTP_404_NOT_FOUND)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    
    return Response({"token": token.key, "user":serializer.data})   

#REGISTER
@swagger_auto_schema(
    method='post',
    request_body=RegisterSerializer,
    responses={
        201: TokenResponseSerializer,
        400: 'Bad Request - validation errors'
    },
    operation_description="Register a new user account"
)
@api_view(['POST'])
def register(request):
    
    serializer = UserSerializer(data = request.data)    
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        
        #make sure password is hashed 
        user.set_password(request.data['password'])
        user.save() 
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "user":serializer.data})  
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 


#TEST TOKEN
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token <your_token_here>",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description="Token is valid",
            examples={
                "application/json": {
                    "message": "Token is valid",
                    "user": "username"
                }
            }
        ),
        401: 'Unauthorized - invalid or missing token'
    },
    operation_description="Test if your authentication token is valid"
)
# api only works if user is authenticated 
@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated]) 
def test_token(request):
    return Response({"message": "Token is valid","user": request.user}) #request should have the user if this func is envoked