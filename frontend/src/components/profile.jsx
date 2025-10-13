import { useAuth } from '../AuthContext';
import DataPopup from './DataPopup';
import ProfileField from './ProfileField';
import './profile.css';

function Profile({ pfp_src }) {
  const { user } = useAuth();

  return (
      <>
      <div className='content-container'>
          <div className='content-title'>Profile</div>
          <div className='content'>
            <div className='profile-picture-wrapper'>
              <img className='profile-picture' src={pfp_src}></img>
              <div className='profile-fields'>
                <ProfileField title="Name" data="Placeholder" />
                <ProfileField title="Age" data="Placeholder" />
                <ProfileField title="Interests" data="Placeholder" />
              </div>
            </div>
            <ProfileField title="Biography" data="Placeholder" />
            
          </div>
      </div>
      </>
  );
}

export default Profile;