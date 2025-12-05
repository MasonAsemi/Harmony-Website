import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import ProfileField from '../components/profile/ProfileField';
import { profileAPI } from '../services/api';
import SongSearch from '../components/profile/SongSearch';
import { API_BASE_URL } from '../config';
import MatchCardPreview from '../components/profile/MatchCardPreview';
import Sidebar from '../components/Sidebar';
import FavArtistList from '../components/profile/FavArtistList';
import FavGenreList from '../components/profile/FavGenreList';

function Profile({ pfp_src }) {
  const { user, token, login } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  const [fav_artists, setFavArtists] = useState([]); 
  const [fav_genres, setFavGenres] = useState([]); 
  
  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setError('No authentication token found');
    }
  }, [token]);

  // Helper function to aggregate artists from songs
  const aggregateArtistsFromSongs = (songs) => {
    const artistMap = new Map();
    
    if (!songs || !Array.isArray(songs)) {
      console.log('No valid songs array provided');
      return [];
    }
    
    console.log('Processing songs for artists:', songs);
    
    songs.forEach((song, index) => {
      console.log(`Song ${index}:`, song);
      
      // Handle different possible structures
      const artistsArray = song.artists || song.artist || [];
      
      if (Array.isArray(artistsArray)) {
        artistsArray.forEach(artist => {
          if (artist && (artist.id || artist.name)) {
            const artistId = artist.id || artist.name; // Use name as fallback ID
            console.log(`Found artist:`, artist);
            artistMap.set(artistId, artist);
          }
        });
      }
    });
    
    const result = Array.from(artistMap.values());
    console.log('Aggregated artists:', result);
    return result;
  };

  // Helper function to aggregate genres from songs
  const aggregateGenresFromSongs = (songs) => {
    const genreMap = new Map();
    
    if (!songs || !Array.isArray(songs)) {
      console.log('No valid songs array provided');
      return [];
    }
    
    console.log('Processing songs for genres:', songs);
    
    songs.forEach((song, index) => {
      console.log(`Song ${index} genres:`, song.genres);
      
      // Handle different possible structures
      const genresArray = song.genres || song.genre || [];
      
      if (Array.isArray(genresArray)) {
        genresArray.forEach(genre => {
          if (genre && (genre.id || genre.name)) {
            const genreId = genre.id || genre.name; // Use name as fallback ID
            console.log(`Found genre:`, genre);
            genreMap.set(genreId, genre);
          }
        });
      }
    });
    
    const result = Array.from(genreMap.values());
    console.log('Aggregated genres:', result);
    return result;
  };

  async function handleImageChange(e) {
    const image = e.target.files[0]
    const imageUrl = URL.createObjectURL(e.target.files[0])
    setImageFile(imageUrl); 

    if (image) {
        const formData = new FormData();
        formData.append('profile_image', image); 

        fetch(API_BASE_URL + '/api/users/me/', { 
            method: 'PATCH',
            body: formData,
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log('Upload successful:', data);
            loadProfile();
        })
        .catch(error => {
            console.error('Upload failed:', error);
        });
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile(token);
      console.log('Profile API Response:', data);
      console.log('Favorite songs from API:', data?.favorite_songs);
      console.log('Favorite artists from API:', data?.favorite_artists);
      console.log('Favorite genres from API:', data?.favorite_genres);
      
      setProfileData(data?.user); // profile endpoint sends song, genre, and artist info 
      
      // The API returns favorite_songs, favorite_artists, and favorite_genres at the root level
      // For users who added songs manually (not via Spotify), we need to extract artists/genres from songs
      
      if (data?.favorite_artists && data.favorite_artists.length > 0) {
        console.log('Using API-provided favorite_artists:', data.favorite_artists);
        setFavArtists(data.favorite_artists);
      } else if (data?.favorite_songs && data.favorite_songs.length > 0) {
        console.log('Extracting artists from songs...');
        const extractedArtists = aggregateArtistsFromSongs(data.favorite_songs);
        console.log('Extracted artists:', extractedArtists);
        setFavArtists(extractedArtists);
      } else {
        console.log('No artists found');
        setFavArtists([]);
      }
      
      if (data?.favorite_genres && data.favorite_genres.length > 0) {
        console.log('Using API-provided favorite_genres:', data.favorite_genres);
        setFavGenres(data.favorite_genres);
      } else if (data?.favorite_songs && data.favorite_songs.length > 0) {
        console.log('Extracting genres from songs...');
        const extractedGenres = aggregateGenresFromSongs(data.favorite_songs);
        console.log('Extracted genres:', extractedGenres);
        setFavGenres(extractedGenres);
      } else {
        console.log('No genres found');
        setFavGenres([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSave = async (fieldName, value) => {
    if (!token) {
      alert('Cannot save: Not authenticated');
      return;
    }

    try {
      const updatedData = await profileAPI.updateProfile(token, {
        [fieldName]: value
      });
      
      setProfileData(updatedData);
      
      if (fieldName === 'username') {
        login(updatedData, token);
      }
    } catch (err) {
      console.error('Error updating field:', err);
      throw err;
    }
  };

  return (
    
    <div className='w-full min-h-screen px-4 py-8 pb-20 md:pb-8' style={{backgroundColor : 'var(--color-bg-light)', padding : 100}}>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* <div className='text-3xl font-bold mb-8 text-gray-800'>Profile</div> */}
      
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-center'>
          {error}
          <button 
            onClick={loadProfile} 
            className='ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
          >
            Retry
          </button>
        </div>
      )}

      <div className='w-full rounded-2xl shadow-lg p-8' style={{backgroundColor : 'var(--color-bg-light)'}}>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          {/* Left side - Match Card Preview */}
          <div className='lg:sticky lg:top-8 flex flex-col gap-4'>
            <h3 className='text-xl font-semibold  text-center' style={{color:'var(--color-text-primary'}} 
            >Profile Preview</h3>
            <p className='text-sm text-center mb-2' style={{color : 'var(--color-text-secondary)'}}>This is how others will see your profile</p>
            <div className='w-full h-[600px] max-h-[70vh]'>
              <MatchCardPreview profileData={{
                ...profileData,
                profile_image: imageFile || profileData?.profile_image
              }} />
            </div>
            <div className='flex justify-center mt-4'>
              <label className='inline-flex items-center justify-center px-6 py-3  hover:bg-rose-600 text-white rounded-lg font-medium cursor-pointer transition-colors' style={{backgroundColor:'var(--color-accent)'}}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                Change Profile Picture
                <input 
                  className='hidden' 
                  type='file' 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          
          {/* Right side - Profile Fields */}
          <div className='lg:col-span-2 flex flex-col gap-6 border-l border-gray-200 pl-0 lg:pl-8'>
            <ProfileField 
              title="Username" 
              data={profileData?.username || 'Not set'} 
              onSave={(value) => handleFieldSave('username', value)}
            />
            <ProfileField 
              title="Age" 
              data={profileData?.age?.toString() || ''} 
              onSave={(value) => handleFieldSave('age', value ? parseInt(value) : null)}
            />
            <ProfileField 
              title="Interests" 
              data={profileData?.interests || ''} 
              onSave={(value) => handleFieldSave('interests', value)}
            />
            <ProfileField 
              title="Biography" 
              data={profileData?.biography || ''} 
              onSave={(value) => handleFieldSave('biography', value)}
              multiline={true}
            />
            <ProfileField 
              title="Location" 
              data={profileData?.location || ''} 
              onSave={(value) => handleFieldSave('location', value)}
            />
            <FavGenreList genreList={fav_genres} />
            <FavArtistList artistList={fav_artists} />
            <SongSearch onSongsUpdate={loadProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;