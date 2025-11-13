import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import ProfileField from '../components/profile/ProfileField';
import { profileAPI } from '../services/api';
import SongSearch from '../components/profile/SongSearch';
import { API_BASE_URL } from '../config';
import MatchCardPreview from '../components/profile/MatchCardPreview';

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
            // Reload profile to get updated image URL
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
    <div className='w-full max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8'>
      <div className='text-3xl font-bold mb-8 text-gray-800'>Profile</div>
      
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

      <div className='w-full'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          {/* Left side - Match Card Preview */}
          <div className='lg:sticky lg:top-8 flex flex-col gap-4'>
            <h3 className='text-xl font-semibold text-gray-800 text-center'>Profile Preview</h3>
            <p className='text-sm text-gray-600 text-center mb-2'>This is how others will see your profile</p>
            <div className='w-full h-[600px] max-h-[70vh]'>
              <MatchCardPreview profileData={{
                ...profileData,
                profile_image: imageFile || profileData?.profile_image
              }} />
            </div>
            <div className='flex justify-center mt-4'>
              <label className='inline-flex items-center justify-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium cursor-pointer transition-colors'>
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
          <div className='lg:col-span-2 flex flex-col gap-6'>
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
            <SongSearch />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;