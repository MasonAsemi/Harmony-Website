/**
 * Attempts to login using either the token or credentials
 * @param {Object} credentials - Object containing username and password 
 * @returns Promise for the login request
 */
export const requestLogin = (credentials) => {
    // Fetch with the authorization token
    return fetch(`${api_url}/api/users/me`, {
    method: 'GET',
    headers: {
        'Authorization': `Token ${localStorage.getItem("token")}`
    }}).then((res) => {
        // If the token is not valid, fetch with the credentials
        if (!res.ok)
        {
            return fetch(`${api_url}/api/api-token-auth/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            })
        }

        // Otherwise, return the response
        return res;
})};

/**
 * Creates a new user with the provided credentials
 * @param {Object} credentials - The username, email and password of the user
 * @returns Promise for the account creation request
 */
export const createUser = (credentials) => {
    return fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
};

/**
 * Requests using the locally stored token to validate it
 * @returns Promise for the authentication check request
 */
export const checkAuth = () => {
    return fetch(`${api_url}/api/users/me`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem("token")}`
    },
})};