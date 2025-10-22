from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # show the additional fields in admin list/display if desired
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Extra', {'fields': ('location', 'profile_image', 'age', 'interests', 'biography')}),
    )