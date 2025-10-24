import { useState, useEffect } from "react";
import Message from "../components/Message";
import { useAuth } from "../components/AuthContext";

const Chat = () =>
{
    const [messages, setMessages] = useState([]);
    const [userContent, setUserContent] = useState('');
    const [response, setResponse] = useState('');

    const [isHoldingShift, setIsHoldingShift] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const placeholderText = 'Send a message...';
    const { user } = useAuth();
    const authUser = new Author(user?.id, user?.username);

    // Check if the user is on mobile
    useEffect(() => 
    {
        const userAgent = navigator.userAgent;

        if (/iPhone|iPad|iPod|Android/i.test(userAgent)) 
        {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    }, []);

    // Update the messages state when a response from the server is loaded
    useEffect(() => 
    {
        // TODO: Use EventSource to listen for server-sent events (chat message sent) and update the messages accordingly
        let updatedMessages = []; 
        setMessages(updatedMessages);
        setResponse('');
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
        setUserContent("");
        // TODO: User userContent (user's input to the chat field) to send the message
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
        <>
            <div className="flex flex-col grow m-3 w-11/12 h-11/12">
                <div className="grow mb-8 p-4 bg-transparent">
                    {messages.map((message, index) => (
                        <Message key={index} author={message.author} userAuthor={message.userAuthor} text={message.text} />
                    ))}
                    <div className={messages.length > 0 ? "hidden" : ""}>
                        <h1 className="text-3xl font-bold text-white">The beginning of your conversation with ...</h1>
                    </div>
                </div>
            </div>
            <div className="fixed w-full bottom-2">
                <div className={"flex items-end rounded-xl p-2 grow ml-1 mr-1 h-max bg-citrus-blue"}>
                    <div data-testid="input" contentEditable="true" suppressContentEditableWarning={true} onBlur={handleOnBlur} onFocus={handleOnFocus} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-placeholder={placeholderText} className="p-1 h-max max-h-32 overflow-auto resize-none flex-grow placeholder:text-slate-300 text-white text-lg bg-transparent rounded">{placeholderText}</div>
                    <button data-testid="submit" onClick={handleReturn} disabled={isButtonDisabled()} className={`flex justify-center items-center text-3xl border p-2 ml-1 w-9 h-9 rounded ${isButtonDisabled() ? "bg-transparent" : "bg-white hover:bg-[#eee]"}`}>
                    </button>
                </div>
            </div>
        </>
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