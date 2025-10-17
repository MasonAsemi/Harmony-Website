import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProfileField from '../components/ProfileField';
import { profileAPI } from '../services/api';
import '../styles/profile.css';

function Profile({ pfp_src }) {
  const { user, token, login } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile(token);
      setProfileData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSave = async (fieldName, value) => {
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

  if (loading) {
    return (
      <div className='content-container'>
        <div className='content-title'>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='content-container'>
        <div className='content-title'>Error</div>
        <p>{error}</p>
        <button onClick={loadProfile}>Retry</button>
      </div>
    );
  }

  return (
    <div className='content-container'>
      <div className='content-title'>Profile</div>
      <div className='content'>
        <div className='profile-picture-wrapper'>
          <img 
            className='profile-picture' 
            src={pfp_src || '/default-avatar.png'}
            alt="Profile"
          />
          <div className='profile-fields'>
            <ProfileField 
              title="Username" 
              data={profileData?.username} 
              onSave={(value) => handleFieldSave('username', value)}
            />
            <ProfileField 
              title="Age" 
              data={profileData?.age?.toString() || ''} 
              onSave={(value) => handleFieldSave('age', value ? parseInt(value) : null)}
            />
            <ProfileField 
              title="Interests" 
              data={profileData?.interests} 
              onSave={(value) => handleFieldSave('interests', value)}
            />
          </div>
        </div>
        <ProfileField 
          title="Biography" 
          data={profileData?.biography} 
          onSave={(value) => handleFieldSave('biography', value)}
          multiline={true}
        />
        <ProfileField 
          title="Location" 
          data={profileData?.location} 
          onSave={(value) => handleFieldSave('location', value)}
        />
      </div>
    </div>
  );
}

export default Profile;