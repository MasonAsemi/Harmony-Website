// Remove the trailing '/api/' - we'll add it in the API calls
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com';

console.log('API_BASE_URL:', API_BASE_URL);