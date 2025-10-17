import { API_BASE_URL } from '../config';

export const profileAPI = {
  // Fetch user profile from backend
    getProfile: async (token) => {
        const response = await fetch(`${API_BASE_URL}/profile/`, {
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

    // Update the user's profile
    updateProfile: async (token, profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile/update/`, {
        method: 'PUT',
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