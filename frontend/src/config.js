// Remove the trailing '/api/' - we'll add it in the API calls
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com';
export const WS_BASE_URL = import.meta.env.VITE_API_URL || 'ws://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com';