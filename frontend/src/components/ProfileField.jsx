/**
 * Used to populate the profile page with data fields such as name, age, etc.
 * @param {string} title - Title of the field (eg. Name)
 * @param {string} data - Value of the field (Eg title='Name' data='John Doe') 
 * @returns {JSX.Element}
 */

const ProfileField = ({ title, data }) => {

  return (
  <div className='content-field'>
    <div className='field-title'>
      <h1>{title}</h1>
      <button className='edit-button'>Edit...</button>
    </div>
    <div className='data-wrapper'>
      <p>{data}</p>
    </div>
  </div>)
}

export default ProfileField