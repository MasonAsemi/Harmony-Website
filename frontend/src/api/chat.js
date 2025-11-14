import { WS_BASE_URL, API_BASE_URL } from "../config";
import axios from 'axios'

export const connectWebsocket = (matchID) => {
  try {
    return new WebSocket(`${WS_BASE_URL}/ws/chat/${matchID}/`);
  } catch (error) {
    console.error("WebSocket connection failed:", error);
  }
};

export const getChats = (matchID) => {
    return axios.get(`${API_BASE_URL}/api/chat/messages/${matchID}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }
    })
};

export const sendMessage = (matchID, user, message) => {
    console.log(localStorage.getItem("token"))
    return axios.post(`${API_BASE_URL}/api/chat/messages/${matchID}/send/`, { 
        user: user,
        message: message
    },
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem("token")}`
        }
    } 
    )
};