import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProfileField from '../components/ProfileField';
import { profileAPI } from '../services/api';
import '../styles/profile.css';
import SongSearch from '../components/SongSearch';
import Sidebar from '../components/Sidebar';

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

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setError('No authentication token found');
    }
  }, [token]);

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
    <div className='content-container'>
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
          <img 
            className='profile-picture' 
            src={pfp_src || '/default-avatar.png'}
            alt="Profile"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="40" text-anchor="middle" x="150" y="160"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
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