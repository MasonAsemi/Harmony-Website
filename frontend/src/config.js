// Always use the environment variable or fall back to production backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://harmony-backend-4080-0c4993847d89.herokuapp.com/api';

console.log('API_BASE_URL:', API_BASE_URL);