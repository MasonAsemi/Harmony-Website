import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { act } from 'react';

import Chat from "./Chat";

// Mocks

vi.mock("../components/auth/AuthContext", () => ({
    useAuth: () => ({
        user: { id: "0", username: "TESTUSER" }
    })
}));

const mockGetChats = vi.fn();
const mockConnectWebsocket = vi.fn();
const mockSendMessage = vi.fn();

const createFakeSocket = () => {
    const eventListeners = {};
    return {
        addEventListener: (type, handler) => {
            if (!eventListeners[type]) {
                eventListeners[type] = [];
            }
            eventListeners[type].push(handler);
        },
        close: vi.fn(),
        listeners: eventListeners
    };
};

vi.mock("../api/chat", () => ({
    getChats: (...args) => mockGetChats(...args),
    connectWebsocket: (...args) => mockConnectWebsocket(...args),
    sendMessage: (...args) => mockSendMessage(...args)
}));

vi.mock("../components/Message", () => ({
    default: ({ author, text }) => <div data-testid="message"> <div>{author.username}</div> <div>{text}</div></div>
}));

// Utilities

const renderChat = (props = {}) => {
    const defaultProps = {
        matches: {},
        currentChatID: "123",
        currentUser: { id: "0", username: "TESTUSER" }
    };
    return render(<Chat {...defaultProps} {...props} />);
};

// Reset

beforeEach(() => {
    mockGetChats.mockReset();
    mockConnectWebsocket.mockReset();
    mockSendMessage.mockReset();

    mockConnectWebsocket.mockImplementation(() => createFakeSocket());
});

afterEach(() => {
    cleanup();
});

// Tests

describe("Chat component", () => {
    test("shows empty message when there are no messages", () => {
        render(
            <Chat
                matches={null}
                currentChatID=""
                currentUser={null}
            />
        );

        expect(
            screen.getByText("The beginning of your conversation...")
        ).toBeInTheDocument();
    });

    test("does not call getChats or connectWebsocket when there is no currentChatID", () => {
        renderChat({ currentChatID: null });

        expect(mockGetChats).not.toHaveBeenCalled();
        expect(mockConnectWebsocket).not.toHaveBeenCalled();
    });

    test("fetches chats and renders messages when API returns data", async () => {
        mockGetChats.mockResolvedValue({
            status: 200,
            data: [
                { sender: "0", sender_username: "TESTUSER", content: "Hi Bob" },
                { sender: "1", sender_username: "bob", content: "Hi TESTUSER" }
            ]
        });

        renderChat();

        // Expect getChats to get the chat with ID 123
        expect(mockGetChats).toHaveBeenCalledWith("123");

        // Messages should show up after getChats resolves
        const messages = await screen.findAllByTestId("message");
        expect(messages).toHaveLength(2);
        expect(messages[0]).toHaveTextContent("Hi Bob");
        expect(messages[0]).toHaveTextContent("TESTUSER");
        expect(messages[1]).toHaveTextContent("Hi TESTUSER");
        expect(messages[1]).toHaveTextContent("bob");
    });

    test("sets up a websocket and appends new messages from 'message' events", async () => {
        mockGetChats.mockResolvedValue({
            status: 200,
            data: []
        });

        renderChat();

        // Expect connectWebsocket to connect to the chat with ID 123
        expect(mockConnectWebsocket).toHaveBeenCalledWith("123");

        const socket = mockConnectWebsocket.mock.results[0].value;
        const messageHandlers = socket.listeners.message;
        expect(messageHandlers).toBeDefined();
        expect(messageHandlers).toHaveLength(1);

        const incoming = {
            message: {
                sender: "3",
                sender_username: "incoming-message-user",
                content: "New message from websocket"
            }
        };

        // Trigger the websocket 'message' handler
        act(() => {
            messageHandlers[0]({ data: JSON.stringify(incoming) });
        })

        const msg = await screen.findByTestId("message");
        expect(msg).toHaveTextContent("New message from websocket");
    });

    test("closes the websocket when the component unmounts", () => {
        mockGetChats.mockResolvedValue({
            status: 200,
            data: []
        });

        const { unmount } = renderChat();

        const socket = mockConnectWebsocket.mock.results[0].value;
        expect(socket.close).not.toHaveBeenCalled();

        unmount();

        expect(socket.close).toHaveBeenCalledTimes(1);
    });
})