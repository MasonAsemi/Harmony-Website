import { WS_BASE_URL } from "../config";

export const connectWebsocket = () => {
  try {
    return new WebSocket(`${WS_BASE_URL}/ws/chat/connect/`);
  } catch (error) {
    console.error("WebSocket connection failed:", error);
  }
};