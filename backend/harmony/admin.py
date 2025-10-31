from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import (
    User, Song, Artist, Genre, 
    UserSongPreference, UserArtistPreference, UserGenrePreference, 
    SpotifyCredentials, Swipe, Match, Message
)

# === CUSTOM USER ADMIN ===
@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'age', 'location', 'song_count', 'artist_count', 'genre_count', 'has_spotify')
    
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('location', 'profile_image', 'age', 'interests', 'biography')}),
    )
    
    def song_count(self, obj):
        return obj.favorite_songs.count()
    song_count.short_description = 'Songs'
    
    def artist_count(self, obj):
        return obj.favorite_artists.count()
    artist_count.short_description = 'Artists'
    
    def genre_count(self, obj):
        return obj.favorite_genres.count()
    genre_count.short_description = 'Genres'
    
    def has_spotify(self, obj):
        try:
            return bool(obj.spotify_credentials)
        except SpotifyCredentials.DoesNotExist:
            return False
    has_spotify.boolean = True
    has_spotify.short_description = 'Spotify'


# === ARTIST ADMIN ===
@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'spotify_id', 'popularity', 'song_count', 'genre_list')
    search_fields = ('name', 'spotify_id')
    list_filter = ('popularity',)
    ordering = ('-popularity',)
    
    def song_count(self, obj):
        return obj.songs.count()
    song_count.short_description = 'Songs'
    
    def genre_list(self, obj):
        genres = list(obj.genres.all()[:3])
        result = ', '.join([g.name for g in genres])
        if obj.genres.count() > 3:
            result += f' (+{obj.genres.count() - 3} more)'
        return result or 'None'
    genre_list.short_description = 'Genres'


# === SONG ADMIN ===
@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('name', 'album', 'popularity', 'duration_display', 'artist_list')
    search_fields = ('name', 'album', 'spotify_id')
    list_filter = ('popularity',)
    ordering = ('-popularity',)
    filter_horizontal = ('artists', 'genres')
    
    def artist_list(self, obj):
        artists = list(obj.artists.all()[:2])
        result = ', '.join([a.name for a in artists])
        if obj.artists.count() > 2:
            result += f' (+{obj.artists.count() - 2} more)'
        return result or 'None'
    artist_list.short_description = 'Artists'
    
    def duration_display(self, obj):
        if obj.duration_ms:
            seconds = obj.duration_ms // 1000
            minutes = seconds // 60
            secs = seconds % 60
            return f"{minutes}:{secs:02d}"
        return "N/A"
    duration_display.short_description = 'Duration'


# === GENRE ADMIN ===
@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'artist_count', 'song_count', 'user_count')
    search_fields = ('name',)
    ordering = ('name',)
    
    def artist_count(self, obj):
        return obj.artists.count()
    artist_count.short_description = 'Artists'
    
    def song_count(self, obj):
        return obj.songs.count()
    song_count.short_description = 'Songs'
    
    def user_count(self, obj):
        return obj.favorited_by.count()
    user_count.short_description = 'Users'


# === USER SONG PREFERENCE ADMIN ===
@admin.register(UserSongPreference)
class UserSongPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'song_name', 'song_artist', 'weight')
    list_filter = ('weight',)  # Fixed: was missing comma, making it a tuple
    search_fields = ('user__username', 'song__name')
    ordering = ('-weight', 'user')
    
    def song_name(self, obj):
        return obj.song.name
    song_name.short_description = 'Song'
    
    def song_artist(self, obj):
        artists = list(obj.song.artists.all()[:2])
        return ', '.join([a.name for a in artists]) if artists else 'Unknown'
    song_artist.short_description = 'Artist'


# === USER ARTIST PREFERENCE ADMIN ===
@admin.register(UserArtistPreference)
class UserArtistPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'artist_name', 'weight')
    list_filter = ('weight',)  # Fixed: was missing comma, making it a tuple
    search_fields = ('user__username', 'artist__name')
    ordering = ('-weight', 'user')
    
    def artist_name(self, obj):
        return obj.artist.name
    artist_name.short_description = 'Artist'


# === USER GENRE PREFERENCE ADMIN ===
@admin.register(UserGenrePreference)
class UserGenrePreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'genre_name', 'weight')
    list_filter = ('weight',)
    search_fields = ('user__username', 'genre__name')
    ordering = ('-weight', 'user')
    
    def genre_name(self, obj):
        return obj.genre.name
    genre_name.short_description = 'Genre'


# === SPOTIFY CREDENTIALS ADMIN ===
@admin.register(SpotifyCredentials)
class SpotifyCredentialsAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_type', 'expires_in', 'has_access_token', 'has_refresh_token', 'scope_display')
    search_fields = ('user__username',)
    readonly_fields = ('access_token', 'refresh_token', 'token_type', 'scope', 'expires_in')
    
    def has_access_token(self, obj):
        return bool(obj.access_token)
    has_access_token.boolean = True
    has_access_token.short_description = 'Access Token'
    
    def has_refresh_token(self, obj):
        return bool(obj.refresh_token)
    has_refresh_token.boolean = True
    has_refresh_token.short_description = 'Refresh Token'
    
    def scope_display(self, obj):
        if obj.scope:
            return obj.scope[:50] + '...' if len(obj.scope) > 50 else obj.scope
        return 'None'
    scope_display.short_description = 'Scope'


# === SWIPE ADMIN ===
@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ('swiper_user', 'target_user', 'type', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('swiper_user__username', 'target_user__username')
    ordering = ('-created_at',)


# === MATCH ADMIN ===
@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'compatibilty_score', 'genre_match', 'artist_match', 'song_match', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user1__username', 'user2__username')
    ordering = ('-compatibilty_score', '-created_at')
    readonly_fields = ('created_at',)


# === MESSAGE ADMIN ===
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content_preview', 'sent_at')
    list_filter = ('sent_at',)
    search_fields = ('sender__username', 'receiver__username', 'content')
    ordering = ('-sent_at',)
    readonly_fields = ('sent_at',)
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'