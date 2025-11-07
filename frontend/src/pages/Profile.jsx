import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import ProfileField from '../components/profile/ProfileField';
import { profileAPI } from '../services/api';
import '../styles/profile.css';
import SongSearch from '../components/profile/SongSearch';
import { API_BASE_URL } from '../config';

function Profile({ pfp_src }) {
  const { user, token, login } = useAuth();
  const [profileData, setProfileData] = useState({
    //username: 'Loading...',
    //** TODO: REMOVE AND UNCOMMENT */
    // age: null,
    // interests: '',
    // biography: '',
    // location: ''

  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null); 

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setError('No authentication token found');
    }
  }, [token]);

  async function handleImageChange(e) {
    const image =e.target.files[0]
    const imageUrl = URL.createObjectURL(e.target.files[0])
    setImageFile(imageUrl); 
    // update user's prof with image 

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
        .then(response => response.json()) // Or response.text() depending on server response
        .then(data => {
            console.log('Upload successful:', data);
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
      setProfileData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile load error:', err);
      // Keep default values when error occurs
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
      
      // Update local state
      setProfileData(updatedData);
      
      // Update user context if username changed
      if (fieldName === 'username') {
        login(updatedData, token);
      }
    } catch (err) {
      console.error('Error updating field:', err);
      throw err;
    }
  };

  return (
    <div className='content-container pb-20 md:pb-0'>
      <div className='content-title'>Profile</div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={loadProfile} 
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px',
              backgroundColor: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className='content'>
        <div className='profile-picture-wrapper'>
          <div className='profile-picture'>
            <img  
              className='profile-picture'
              src={imageFile || profileData?.profile_image   }
            />
            <input className='imageButton' type='file' onChange={handleImageChange}/>
            
          </div>
          
          <div className='profile-fields'>
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
          </div>
          
        </div>
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
        <SongSearch />
      </div>
    </div>
  );
}

export default Profile;