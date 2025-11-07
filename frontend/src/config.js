// Trailing API is removed, but still appears?
const loaded_url = import.meta.env.VITE_API_URL;
console.log("loaded_url: "+  loaded_url) 
export const API_BASE_URL =  loaded_url || 'https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com';

console.log('API_BASE_URL:', API_BASE_URL);