import { API_BASE_URL } from '../config';

console.log('=== API.JS LOADED ===');
console.log('API_BASE_URL in api.js:', API_BASE_URL);

export const profileAPI = {
    getProfile: async (token) => {
        const fullURL = `${API_BASE_URL}/api/users/me/`;  // Add /api/ here
        console.log('Fetching profile from:', fullURL);
        console.log('Token:', token);
        
        const response = await fetch(fullURL, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response URL:', response.url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        return response.json();
    },

    updateProfile: async (token, profileData) => {
        const response = await fetch(`${API_BASE_URL}/api/users/me/`, {  // Add /api/ here
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