import { API_BASE_URL } from '../config';

console.log('=== API.JS LOADED ===');
console.log('API_BASE_URL in api.js:', API_BASE_URL);

export const profileAPI = {
    // Endpoint needs to authenticate the token and return the user data to regenerate the front-end
    checkAuth: async (token) => {
        try {
            const testResponse = await fetch(`${API_BASE_URL}/test-token/`, {
                method: 'GET',
                headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
                },
            });
            console.log('Test token status:', testResponse.status);
            return testResponse;

        } catch (e) {
            console.error('Test token failed:', e);
        }
    },

    getProfile: async (token) => {
        // First test if token works
        const checkRes = await profileAPI.checkAuth(token);

        if (!checkRes.ok)
        {
            throw new Error('User is not authenticated');
        }

        const fullURL = `${API_BASE_URL}/profile/`;
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