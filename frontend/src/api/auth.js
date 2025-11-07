import { API_BASE_URL } from "../config";

/**
 * Logs the user in with their credentials if they don't have a valid token. 
 * @param {Object} credentials - Object containing username and password 
 * @returns Promise for the login request. Provides either a token if they don't have one, or the user data if their token is valid.
 */
export const requestLogin = (credentials) => {
    // Fetch with the authorization token
    return getUserData().then((res) => {
        // If the token is not valid, fetch with the credentials
        if (!res.ok)
        {
            return checkCredentials(credentials)
        }

        // Otherwise, return the response
        return res;
})};

/**
 * Uses the provided credentials to request a session token 
 * @param {Object} credentials - Object containing username and password 
 * @returns Promise for the login request. Responds with a session token for persistent authentication
 */
export const checkCredentials = (credentials) => {
    return fetch(`${API_BASE_URL}api-token-auth/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    })
}

/**
 * Creates a new user with the provided credentials
 * @param {Object} credentials - The username, email and password of the user
 * @returns Promise for the account creation request
 */
export const createUser = (credentials) => {
    return fetch(`${API_BASE_URL}users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
};

/**
 * Requests using the locally stored token to validate it
 * @returns Promise for the authentication check request. Responds with user data if valid
 */
export const getUserData = () => {
    return fetch(`${API_BASE_URL}users/me`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem("token")}`
    },
})};