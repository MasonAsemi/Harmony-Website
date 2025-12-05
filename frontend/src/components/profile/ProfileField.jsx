import { useState } from 'react';

/**
 * Used to populate the profile page with data fields such as name, age, etc.
 * @param {string} title - Title of the field (eg. Name)
 * @param {string} data - Value of the field (Eg title='Name' data='John Doe')
 * @param {function} onSave - Callback function when save is clicked
 * @param {boolean} multiline - Whether to use textarea instead of input
 * @returns {JSX.Element}
 */
const ProfileField = ({ title, data, onSave, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(data || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(data || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='content-field' style={{backgroundColor: 'var(--color-secondary)', borderRadius:8, padding:16, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
      <div className='field-title'>
        <h1 style={{color: "var(--color-text-primary)", fontWeight:'bold'}}>{title}</h1>
        {!isEditing ? (
          <button className='edit-button' onClick={handleEdit} style={{backgroundColor : 'var(--color-accent)', color:"var(--color-text-light)", borderRadius:8}}>
            Edit...
          </button>
        ) : (
          <div className='edit-actions'>
            <button 
              className='save-button' 
              onClick={handleSave}
              disabled={isSaving}
              style={{backgroundColor: "var(--color-tertiary)"}}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              className='cancel-button' 
              onClick={handleCancel}
              disabled={isSaving}
              style={{backgroundColor: "var(--color-accent)"}}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className='data-wrapper'>
        {isEditing ? (
          multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className='edit-textarea'
              rows={5}
              disabled={isSaving}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className='edit-input'
              disabled={isSaving}
            />
          )
        ) : (
          <p style={{color: "var(--color-text-secondary)"}}
           >{data || 'Not set'}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileField;