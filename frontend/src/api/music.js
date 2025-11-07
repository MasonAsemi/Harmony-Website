import { API_BASE_URL } from "../config";
import axios from 'axios'

/**
 * API call through the backend to Spotify for querying a song 
 * @param {string} query - The query to send for the search 
 * @returns Promise for the search request.
 */
export const searchSong = (searchQuery) => {
    // Fetch with the authorization token
    return axios.get(`${API_BASE_URL}/api/search`, {
        params: {
            query: searchQuery
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }
    })
};

export const addUserSong = (song) => {
    // Fetch with the authorization token
    return axios.post(`${API_BASE_URL}/api/songs/`, song, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }
    })
};

export const deleteUserSong = (song) => {
    // Fetch with the authorization token
    return axios.delete(`${API_BASE_URL}/api/songs/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }, 
        data: song
    })
};

export const getUserSongs = () => {
    // Fetch with the authorization token
    return axios.get(`${API_BASE_URL}/api/songs/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }
    })
};