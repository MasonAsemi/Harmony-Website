import { API_BASE_URL } from '../config';

console.log('=== API.JS LOADED ===');
console.log('API_BASE_URL in api.js:', API_BASE_URL);

export const profileAPI = {
  getProfile: async (token) => {
    const fullURL = `${API_BASE_URL}/users/me/`;
    console.log('Fetching profile from:', fullURL);

    const response = await fetch(fullURL, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  updateProfile: async (token, profileData) => {
    const url = `${API_BASE_URL}/users/me/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  },
};