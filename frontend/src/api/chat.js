import { WS_BASE_URL } from "../config";

export const connectWebsocket = () => {
    try {
        return new WebSocket(`ws://localhost:8000/ws/chat/connect/`);
    } catch (error) {
        console.error(error);
    }
}