import React, { useState, useEffect } from 'react';

const DataPopup = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://harmony-backend-4080-0c4993847d89.herokuapp.com/api/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      console.log(result);
      
      if (result) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const popupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid black',
    zIndex: 1000,
    maxWidth: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose}></div>
      <div style={popupStyle}>
        <h2>Database Data</h2>
        <button onClick={onClose} style={{float: 'right'}}>Close</button>
        
        {loading && <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        
        {!loading && !error && data && data.users && data.users.length > 0 && (
          <table border="1" style={{width: '100%', marginTop: '20px'}}>
            <thead>
              <tr>
                {Object.keys(data.users[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value?.toString() || 'N/A'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <button onClick={fetchData} style={{marginTop: '10px'}}>Refresh</button>
      </div>
    </>
  );
};

export default DataPopup;