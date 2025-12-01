// frontend/src/config.js

const API_BASE_URL_ENV = import.meta.env.VITE_API_URL;
const WS_BASE_URL_ENV = import.meta.env.VITE_WS_URL;
const MODE = import.meta.env.MODE; // "development", "production", etc.

const LOCAL_API_BASE_URL = "http://localhost:8000";
const LOCAL_WS_BASE_URL = "ws://localhost:8000";

const PROD_API_BASE_URL = "https://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com";
const PROD_WS_BASE_URL = "wss://harmony-backend-4800-3fc8f73b6cb5.herokuapp.com";

const isDev = MODE === "development" || "test";

export const API_BASE_URL =
    API_BASE_URL_ENV ??
    (isDev ? LOCAL_API_BASE_URL : PROD_API_BASE_URL);

export const WS_BASE_URL =
    WS_BASE_URL_ENV ??
    (isDev ? LOCAL_WS_BASE_URL : PROD_WS_BASE_URL);
