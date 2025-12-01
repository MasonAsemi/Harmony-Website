import pytest
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from unittest.mock import patch, MagicMock
import json
from datetime import datetime

from .models import (
    User, Genre, Artist, Song, UserSongPreference, UserArtistPreference,
    UserGenrePreference, SpotifyCredentials, Swipe, Match, MatchRejection,
    Message, MatchWeightSettings
)
from .views import (
    get_spotify_token, song_search, spotify_login, spotify_callback,
    get_song_embed, translate_spotify_songs, translate_spotify_artist_and_genres,
    get_spotify_users_fav_songs, get_spotify_user_fav_artists, matches,
    match_accept, match_reject, return_accepted_matches, get_full_matches,
    match_weight_settings
)

User = get_user_model()


class UserModelTests(TestCase):
    """Test User model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
    
    def test_user_with_profile_data(self):
        self.user.location = 'New York'
        self.user.age = 25
        self.user.biography = 'Test bio'
        self.user.interests = 'Music, Art'
        self.user.save()
        
        user = User.objects.get(id=self.user.id)
        self.assertEqual(user.location, 'New York')
        self.assertEqual(user.age, 25)
        self.assertEqual(user.biography, 'Test bio')
    
    def test_user_str_method(self):
        self.assertEqual(str(self.user), 'testuser')


class GenreModelTests(TestCase):
    """Test Genre model"""
    
    def setUp(self):
        self.genre = Genre.objects.create(name='Rock')
    
    def test_genre_creation(self):
        self.assertEqual(self.genre.name, 'Rock')
    
    def test_genre_unique_constraint(self):
        with self.assertRaises(Exception):
            Genre.objects.create(name='Rock')
    
    def test_genre_str_method(self):
        self.assertEqual(str(self.genre), 'Rock')
    
    def test_genre_ordering(self):
        Genre.objects.create(name='Blues')
        Genre.objects.create(name='Jazz')
        genres = Genre.objects.all()
        self.assertEqual(genres[0].name, 'Blues')


class ArtistModelTests(TestCase):
    """Test Artist model"""
    
    def setUp(self):
        self.genre = Genre.objects.create(name='Rock')
        self.artist = Artist.objects.create(
            name='The Beatles',
            spotify_id='spotify_123',
            image_url='http://example.com/image.jpg',
            popularity=95
        )
    
    def test_artist_creation(self):
        self.assertEqual(self.artist.name, 'The Beatles')
        self.assertEqual(self.artist.spotify_id, 'spotify_123')
        self.assertEqual(self.artist.popularity, 95)
    
    def test_artist_genres_relation(self):
        self.artist.genres.add(self.genre)
        self.assertIn(self.genre, self.artist.genres.all())
    
    def test_artist_str_method(self):
        self.assertEqual(str(self.artist), 'The Beatles')
    
    def test_artist_spotify_id_unique(self):
        with self.assertRaises(Exception):
            Artist.objects.create(
                name='Another Band',
                spotify_id='spotify_123'
            )


class SongModelTests(TestCase):
    """Test Song model"""
    
    def setUp(self):
        self.artist = Artist.objects.create(
            name='The Beatles',
            spotify_id='spotify_123'
        )
        self.genre = Genre.objects.create(name='Rock')
        self.song = Song.objects.create(
            name='Hey Jude',
            spotify_id='song_123',
            album='White Album',
            popularity=90,
            duration_ms=431000
        )
        self.song.artists.add(self.artist)
        self.song.genres.add(self.genre)
    
    def test_song_creation(self):
        self.assertEqual(self.song.name, 'Hey Jude')
        self.assertEqual(self.song.spotify_id, 'song_123')
    
    def test_song_artists_relation(self):
        self.assertIn(self.artist, self.song.artists.all())
    
    def test_song_genres_relation(self):
        self.assertIn(self.genre, self.song.genres.all())
    
    def test_song_audio_features(self):
        self.song.energy = 0.8
        self.song.valence = 0.7
        self.song.danceability = 0.6
        self.song.tempo = 120.0
        self.song.acousticness = 0.1
        self.song.save()
        
        song = Song.objects.get(id=self.song.id)
        self.assertEqual(song.energy, 0.8)
        self.assertEqual(song.tempo, 120.0)
    
    def test_song_str_method(self):
        self.assertIn('Hey Jude', str(self.song))
        self.assertIn('The Beatles', str(self.song))


class UserSongPreferenceTests(TestCase):
    """Test UserSongPreference model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
        self.artist = Artist.objects.create(name='Artist', spotify_id='a1')
        self.song = Song.objects.create(name='Song', spotify_id='s1')
        self.song.artists.add(self.artist)
    
    def test_preference_creation(self):
        pref = UserSongPreference.objects.create(
            user=self.user,
            song=self.song,
            weight=8
        )
        self.assertEqual(pref.weight, 8)
    
   
    def test_unique_together_constraint(self):
        UserSongPreference.objects.create(user=self.user, song=self.song, weight=5)
        with self.assertRaises(Exception):
            UserSongPreference.objects.create(user=self.user, song=self.song, weight=7)


class UserArtistPreferenceTests(TestCase):
    """Test UserArtistPreference model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
        self.artist = Artist.objects.create(name='Artist', spotify_id='a1')
    
    def test_artist_preference_creation(self):
        pref = UserArtistPreference.objects.create(
            user=self.user,
            artist=self.artist,
            weight=7
        )
        self.assertEqual(pref.weight, 7)


class UserGenrePreferenceTests(TestCase):
    """Test UserGenrePreference model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
        self.genre = Genre.objects.create(name='Rock')
    
    def test_genre_preference_creation(self):
        pref = UserGenrePreference.objects.create(
            user=self.user,
            genre=self.genre,
            weight=9
        )
        self.assertEqual(pref.weight, 9)


class SpotifyCredentialsTests(TestCase):
    """Test SpotifyCredentials model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
    
    def test_credentials_creation(self):
        creds = SpotifyCredentials.objects.create(
            user=self.user,
            access_token='token123',
            token_type='Bearer',
            scope='user-read-email',
            expires_in=3600,
            refresh_token='refresh123'
        )
        self.assertEqual(creds.access_token, 'token123')
    
    def test_one_to_one_relationship(self):
        SpotifyCredentials.objects.create(user=self.user, access_token='token1')
        with self.assertRaises(Exception):
            SpotifyCredentials.objects.create(user=self.user, access_token='token2')


class SwipeModelTests(TestCase):
    """Test Swipe model"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
    
    def test_like_swipe(self):
        swipe = Swipe.objects.create(
            swiper_user=self.user1,
            target_user=self.user2,
            type='LIKE'
        )
        self.assertEqual(swipe.type, 'LIKE')
    
    def test_dislike_swipe(self):
        swipe = Swipe.objects.create(
            swiper_user=self.user1,
            target_user=self.user2,
            type='DISLIKE'
        )
        self.assertEqual(swipe.type, 'DISLIKE')
    
    def test_swipe_str_method(self):
        swipe = Swipe.objects.create(
            swiper_user=self.user1,
            target_user=self.user2,
            type='LIKE'
        )
        self.assertIn('like', str(swipe).lower())


class MatchModelTests(TestCase):
    """Test Match model"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
    
    def test_match_creation(self):
        match = Match.objects.create(
            user1=self.user1,
            user2=self.user2,
            compatibilty_score=85.5
        )
        self.assertEqual(match.compatibilty_score, 85.5)
    
    def test_match_with_scores(self):
        match = Match.objects.create(
            user1=self.user1,
            user2=self.user2,
            genre_match=80.0,
            artist_match=85.0,
            song_match=90.0
        )
        self.assertEqual(match.genre_match, 80.0)
        self.assertEqual(match.artist_match, 85.0)
        self.assertEqual(match.song_match, 90.0)


class MatchRejectionTests(TestCase):
    """Test MatchRejection model"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
    
    def test_rejection_creation(self):
        rejection = MatchRejection.objects.create(
            user1=self.user1,
            user2=self.user2
        )
        self.assertIsNotNone(rejection.created_at)


class MessageModelTests(TestCase):
    """Test Message model"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
    
    def test_message_creation(self):
        msg = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            content='Hello!'
        )
        self.assertEqual(msg.content, 'Hello!')
        self.assertIsNotNone(msg.sent_at)


class MatchWeightSettingsTests(TestCase):
    """Test MatchWeightSettings model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser')
    
    def test_settings_creation(self):
        settings = MatchWeightSettings.objects.create(
            user=self.user,
            genre_weight=1.5,
            artist_weight=2.0,
            song_weight=1.0
        )
        self.assertEqual(settings.genre_weight, 1.5)
        self.assertEqual(settings.artist_weight, 2.0)


class UserViewSetTests(APITestCase):
    """Test UserViewSet endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_create_user(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123'
        }
        response = self.client.post('/api/users/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
    
    def test_me_endpoint_get(self):
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
    
    def test_me_endpoint_patch(self):
        data = {'biography': 'Updated bio', 'age': 30}
        response = self.client.patch('/api/users/me/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user = User.objects.get(id=self.user.id)
        self.assertEqual(user.biography, 'Updated bio')
        self.assertEqual(user.age, 30)
    
    def test_profile_endpoint(self):
        genre = Genre.objects.create(name='Rock')
        artist = Artist.objects.create(name='Artist', spotify_id='a1')
        song = Song.objects.create(name='Song', spotify_id='s1')
        song.artists.add(artist)
        song.genres.add(genre)
        
        UserSongPreference.objects.create(user=self.user, song=song, weight=8)
        UserArtistPreference.objects.create(user=self.user, artist=artist, weight=7)
        UserGenrePreference.objects.create(user=self.user, genre=genre, weight=9)
        
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('favorite_songs', response.data)
        self.assertIn('favorite_artists', response.data)
        self.assertIn('favorite_genres', response.data)
        self.assertEqual(response.data['stats']['total_songs'], 1)


class SongViewSetTests(APITestCase):
    """Test SongViewSet endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        self.artist = Artist.objects.create(name='Artist', spotify_id='a1')
        self.song = Song.objects.create(
            name='Song',
            spotify_id='s1',
            album='Album',
            popularity=80
        )
        self.song.artists.add(self.artist)
    
    @patch('harmony.views.get_spotify_token')
    def test_create_song_existing(self, mock_token):
        UserSongPreference.objects.create(user=self.user, song=self.song, weight=5)
        
        data = {'spotify_id': 's1', 'weight': 7}
        response = self.client.post('/api/songs/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_songs(self):
        UserSongPreference.objects.create(user=self.user, song=self.song, weight=8)
        
        response = self.client.get('/api/songs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_destroy_song(self):
        pref = UserSongPreference.objects.create(user=self.user, song=self.song)
        
        response = self.client.delete(f'/api/songs/{self.song.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        self.assertFalse(
            UserSongPreference.objects.filter(user=self.user, song=self.song).exists()
        )
    
    def test_update_song_weight(self):
        UserSongPreference.objects.create(user=self.user, song=self.song, weight=5)
        
        data = {'weight': 9}
        response = self.client.patch(f'/api/songs/{self.song.id}/update_weight/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['weight'], 9)


class SpotifyUtilityFunctionTests(TestCase):
    """Test Spotify utility functions"""
    
    @patch('harmony.views.requests.post')
    def test_get_spotify_token_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'access_token': 'token123'}
        mock_post.return_value = mock_response
        
        token = get_spotify_token('client_id', 'client_secret')
        self.assertEqual(token, 'token123')
    
    @patch('harmony.views.requests.post')
    def test_get_spotify_token_failure(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_post.return_value = mock_response
        
        with self.assertRaises(Exception):
            get_spotify_token('client_id', 'client_secret')
    
    @patch('harmony.views.requests.get')
    def test_get_song_embed_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'html': '<iframe>...</iframe>'}
        mock_get.return_value = mock_response
        
        embed = get_song_embed('http://spotify.com/track/123')
        self.assertEqual(embed['html'], '<iframe>...</iframe>')
    
    @patch('harmony.views.requests.get')
    def test_get_song_embed_failure(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        embed = get_song_embed('http://spotify.com/track/123')
        self.assertEqual(embed, {})


class SongSearchTests(APITestCase):
    """Test song_search endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_song_search_no_query(self):
        response = self.client.get('/api/song-search/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('harmony.views.get_spotify_token')
    @patch('harmony.views.requests.get')
    def test_song_search_success(self, mock_get, mock_token):
        mock_token.return_value = 'token123'
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'items': [{
                    'id': 's1',
                    'name': 'Song',
                    'album': {'name': 'Album', 'images': [{'url': 'image.jpg'}]},
                    'external_urls': {'spotify': 'http://spotify.com'},
                    'preview_url': 'preview.mp3',
                    'duration_ms': 200000,
                    'popularity': 80,
                    'artists': [{'id': 'a1', 'name': 'Artist'}]
                }]
            }
        }
        mock_get.return_value = mock_response
        
        response = self.client.get('/api/song-search/?query=Song')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class MatchesTests(APITestCase):
    """Test matches endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', location='NYC', age=25)
        self.user2 = User.objects.create_user(username='user2', location='LA', age=26)
        self.token = Token.objects.create(user=self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_matches_endpoint(self):
        response = self.client.get('/api/matches/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('matches', response.data)
    
    def test_matches_excludes_current_user(self):
        response = self.client.get('/api/matches/')
        user_ids = [m['id'] for m in response.data['matches']]
        self.assertNotIn(self.user1.id, user_ids)
    
    def test_matches_excludes_already_matched(self):
        Match.objects.create(user1=self.user1, user2=self.user2)
        response = self.client.get('/api/matches/')
        user_ids = [m['id'] for m in response.data['matches']]
        self.assertNotIn(self.user2.id, user_ids)
    
    def test_matches_excludes_rejected(self):
        MatchRejection.objects.create(user1=self.user1, user2=self.user2)
        response = self.client.get('/api/matches/')
        user_ids = [m['id'] for m in response.data['matches']]
        self.assertNotIn(self.user2.id, user_ids)


class MatchAcceptTests(APITestCase):
    """Test match_accept endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
        self.token = Token.objects.create(user=self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_match_accept_get(self):
        Match.objects.create(user1=self.user1, user2=self.user2)
        response = self.client.get('/api/match/accept/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_match_accept_post(self):
        data = {'id': self.user2.id}
        response = self.client.post('/api/match/accept/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_match_accept_no_user_id(self):
        response = self.client.post('/api/match/accept/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_match_accept_user_not_found(self):
        data = {'id': 9999}
        response = self.client.post('/api/match/accept/', data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MatchRejectTests(APITestCase):
    """Test match_reject endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1')
        self.user2 = User.objects.create_user(username='user2')
        self.token = Token.objects.create(user=self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_match_reject_success(self):
        data = {'id': self.user2.id}
        response = self.client.post('/api/match/reject/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_match_reject_no_id(self):
        response = self.client.post('/api/match/reject/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_match_reject_duplicate(self):
        MatchRejection.objects.create(user1=self.user1, user2=self.user2)
        data = {'id': self.user2.id}
        response = self.client.post('/api/match/reject/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MatchRejection.objects.filter(
            user1=self.user1, user2=self.user2).count(), 1)


class MatchWeightSettingsTests(APITestCase):
    """Test match_weight_settings endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_get_settings_default(self):
        response = self.client.get('/api/settings/match-weights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['genre_weight'], 1.0)
    
    def test_post_settings(self):
        data = {
            'genre_weight': 2.0,
            'artist_weight': 1.5,
            'song_weight': 1.0
        }
        response = self.client.post('/api/settings/match-weights/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['genre_weight'], 2.0)