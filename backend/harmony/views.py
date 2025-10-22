
from rest_framework import viewsets, permissions, status 
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import User
from .serializers import UserSerializer
from .permissions import IsSelfOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


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
