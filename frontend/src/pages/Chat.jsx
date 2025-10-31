import { useState, useEffect } from "react";
import Message from "../components/Message";
import { useAuth } from "../components/AuthContext";
import { API_BASE_URL } from "../config";

const Chat = ({ currentChat }) =>
{
    const [messages, setMessages] = useState([]);
    const [userContent, setUserContent] = useState('');
    const [response, setResponse] = useState('');

    const [isHoldingShift, setIsHoldingShift] = useState(false);
    const placeholderText = 'Send a message...';
    const { user } = useAuth();
    const authUser = new Author(user?.id, user?.username);

    // Update the messages state when a response from the server is loaded
    useEffect(() => 
    {
        // Use web sockets

        console.error("Implement needed: API endpoint for creating web socket");
        return;
        const socket = new WebSocket(`${API_BASE_URL}`);

        socket.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, newMessage]);
        };

        setResponse('');

        return () => socket.close();
    }, []);

    // Returns true if the button should be disabled, false if not
    const isButtonDisabled = () => 
    {
        return userContent.length === 0 || userContent === '\n';
    };

    // Event Handlers

    // Handles the process for when the user submits a message
    // Creates the next two messages: the user message and the assistant response skeleton while waiting for a response
    // If the last assistant response was unsuccessful, then it will override the unsuccessful response and user message that prompted it
    const handleReturn = async () => 
    {
        console.log(user)
        messages.push({author: user, userAuthor: user, text: userContent});
        // TODO: User userContent (user's input to the chat field) to send the message
        // ...
        setUserContent("");
    };

    // Handles the onBlur event for the input field, updating the placeholder and text accordingly
    const handleOnBlur = (event) => 
    {
        if (event.target.innerText === '' || event.target.innerText === '\n')
            event.target.innerText = placeholderText;
        else
            event.target.innerText;
    };

    // Handles the onFocus event for the input field. Intended for clearing the placeholder text upon focusing
    const handleOnFocus = (event) => 
    {
        event.target.innerText = '';
    };

    const handleKeyDown = (event) => 
    {
        if (event.key == 'Shift')
            {
                setIsHoldingShift(true);
            }
        if (event.key == 'Enter' && !isHoldingShift)
        {
            event.target.innerText = '';
            event.target.blur();
            handleReturn();
        }
    };

    const handleKeyUp = (event) => 
    {
        setUserContent(event.target.innerText);
        if (event.key == 'Shift')
        {
            setIsHoldingShift(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500">
                {messages.map((message, index) => (
                    <Message key={index} author={message.author} userAuthor={message.userAuthor} text={message.text} />
                ))}
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <h1 className="text-3xl font-bold text-white">The beginning of your conversation...</h1>
                    </div>
                )}
            </div>
            
            {/* Input area at bottom */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex flex-row gap-2 w-full">
                    <div 
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 min-h-[50px] max-h-[150px] overflow-y-auto focus:outline-none focus:border-rose-400" 
                        data-testid="input" 
                        contentEditable="true" 
                        suppressContentEditableWarning={true} 
                        onBlur={handleOnBlur} 
                        onFocus={handleOnFocus} 
                        onKeyDown={handleKeyDown} 
                        onKeyUp={handleKeyUp}
                    >
                        {placeholderText}
                    </div>
                    <button 
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            isButtonDisabled() 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-rose-500 text-white hover:bg-rose-600"
                        }`} 
                        data-testid="submit" 
                        onClick={handleReturn} 
                        disabled={isButtonDisabled()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Author class for describing messages
 * @param {string} id - User's ID
 * @param {string} username - User's username
 */
export class Author {
    constructor(id, username)
    {
        this.id = id;
        this.username = username;
    }
}

export default Chat;