# harmony/permissions.py
from rest_framework import permissions

class IsSelfOrReadOnly(permissions.BasePermission):
    """
    users are only allowed to edit their own data
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed for anyone
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        # Write permissions only for the owner
        return obj == request.user
