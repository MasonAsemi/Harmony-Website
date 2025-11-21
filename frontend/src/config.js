// frontend/src/config.js

// Get the backend base URL from environment variables (if set)
const API_BASE_URL_ENV = import.meta.env.VITE_API_URL;

// Default backend HTTP and WebSocket URLs
const LOCAL_API_BASE_URL = "http://localhost:8000";
const LOCAL_WS_BASE_URL = "ws://localhost:8000";

// Detect if we're running locally or in production
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Set API and WebSocket URLs accordingly
export const API_BASE_URL = API_BASE_URL_ENV || (isLocal
  ? LOCAL_API_BASE_URL
  : "https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com");

export const WS_BASE_URL = isLocal
  ? LOCAL_WS_BASE_URL
  : "wss://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com";

console.log("API_BASE_URL:", API_BASE_URL);
console.log("WS_BASE_URL:", WS_BASE_URL);