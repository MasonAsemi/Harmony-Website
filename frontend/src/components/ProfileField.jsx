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