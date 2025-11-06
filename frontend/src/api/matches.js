import { API_BASE_URL } from "../config";

/**
 * Fetches the list of potential matches for the authenticated user
 * @param {string} token - Authentication token
 * @returns Promise for the matches request
 */
export const getMatches = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/matches/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch matches');
    }

    return response.json();
};

/**
 * Fetches the list of accepted matches for the authenticated user
 * Note: This requires a backend endpoint that returns Match objects
 * @param {string} token - Authentication token
 * @returns Promise for the accepted matches request
 */
export const getAcceptedMatches = async (token) => {
    const response = await fetch(`${API_BASE_URL}matches/accepted/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch accepted matches');
    }

    return response.json();
};

/**
 * Accepts a match with the specified user
 * @param {string} token - Authentication token
 * @param {number} userId - ID of the user to match with
 * @returns Promise for the accept request
 */
export const acceptMatch = async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/api/matches/accept/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ id: userId })
    });

    if (!response.ok) {
        throw new Error('Failed to accept match');
    }

    return response.json();
};

/**
 * Rejects a match with the specified user
 * @param {string} token - Authentication token
 * @param {number} userId - ID of the user to reject
 * @returns Promise for the reject request
 */
export const rejectMatch = async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/api/matches/reject/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ id: userId })
    });

    if (!response.ok) {
        throw new Error('Failed to reject match');
    }

    return response.json();
};