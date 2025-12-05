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

  // Helper function to aggregate genres from songs and return top 3 most common
  const aggregateGenresFromSongs = (songs) => {
    const genreCountMap = new Map();
    
    if (!songs || !Array.isArray(songs)) {
      console.log('No valid songs array provided for genres');
      return [];
    }
    
    console.log('=== Processing songs for genres ===');
    console.log('Total songs:', songs.length);
    
    songs.forEach((song, index) => {
      console.log(`Song ${index} full data:`, JSON.stringify(song, null, 2));
      
      // The API returns genres as an array directly on the song object
      const genresArray = song.genres || [];
      
      console.log(`Song ${index} (${song.name}) genres:`, genresArray);
      
      if (Array.isArray(genresArray) && genresArray.length > 0) {
        console.log(`Found ${genresArray.length} genres in song "${song.name}"`);
        
        genresArray.forEach(genre => {
          console.log('Raw genre data:', genre);
          
          // Handle different genre formats
          let genreObj = null;
          
          if (typeof genre === 'string') {
            // Genre is a simple string
            genreObj = { id: genre, name: genre };
            console.log('Genre is string:', genre);
          } else if (typeof genre === 'object' && genre !== null) {
            // Genre is an object - use its properties
            genreObj = {
              id: genre.id || genre.name || JSON.stringify(genre),
              name: genre.name || genre.id || 'Unknown'
            };
            console.log('Genre is object:', genreObj);
          }
          
          if (genreObj && genreObj.name && genreObj.name !== 'Unknown') {
            const genreId = genreObj.id;
            console.log(`Processing genre: ${genreObj.name} (ID: ${genreId})`);
            
            // Count genre occurrences
            if (genreCountMap.has(genreId)) {
              const existing = genreCountMap.get(genreId);
              existing.count += 1;
              console.log(`Genre "${genreObj.name}" count increased to: ${existing.count}`);
            } else {
              genreCountMap.set(genreId, {
                ...genreObj,
                count: 1
              });
              console.log(`Genre "${genreObj.name}" added with count: 1`);
            }
          } else {
            console.log('Skipping invalid genre:', genre);
          }
        });
      } else {
        console.log(`No genres found for song "${song.name}"`);
      }
    });
    
    console.log('=== Genre count summary ===');
    const genreEntries = Array.from(genreCountMap.entries());
    genreEntries.forEach(([id, data]) => {
      console.log(`Genre: ${data.name}, Count: ${data.count}`);
    });
    
    // Sort by count (descending) and take top 3
    const sortedGenres = Array.from(genreCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ count, ...genre }) => {
        console.log(`✓ Top genre: "${genre.name}" (appeared ${count} times)`);
        return genre;
      });
    
    console.log('=== Final top 3 genres ===');
    console.log(sortedGenres);
    return sortedGenres;
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
      console.log('=== PROFILE API RESPONSE ===');
      console.log('Full data:', data);
      console.log('Favorite songs:', data?.favorite_songs);
      
      // Log the first song in detail to see structure
      if (data?.favorite_songs && data.favorite_songs.length > 0) {
        console.log('First song detailed structure:', JSON.stringify(data.favorite_songs[0], null, 2));
      }
      
      console.log('Favorite artists from API:', data?.favorite_artists);
      console.log('Favorite genres from API:', data?.favorite_genres);
      
      setProfileData(data?.user); // profile endpoint sends song, genre, and artist info 
      
      // Process artists
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
      
      // Process genres - ALWAYS aggregate from songs to get top 3 most common
      if (data?.favorite_songs && data.favorite_songs.length > 0) {
        console.log('Extracting top 3 genres from songs...');
        const extractedGenres = aggregateGenresFromSongs(data.favorite_songs);
        console.log('Setting extracted top 3 genres:', extractedGenres);
        setFavGenres(extractedGenres);
      } else if (data?.favorite_genres && data.favorite_genres.length > 0) {
        console.log('No songs available, using API-provided favorite_genres (top 3)');
        setFavGenres(data.favorite_genres.slice(0, 3));
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
                profile_image: imageFile || profileData?.profile_image,
                fav_artists: fav_artists,
                fav_genres: fav_genres
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