import { useState, useEffect } from "react";
import Message from "../components/Message";
import { useAuth } from "../components/AuthContext";

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
        <div className="size-full">
            <div className="flex flex-col bg-black h-11/12">
                <div className="grow mb-8 p-4 bg-transparent">
                    {messages.map((message, index) => (
                        <Message key={index} author={message.author} userAuthor={message.userAuthor} text={message.text} />
                    ))}
                    <div className={messages.length > 0 ? "hidden" : ""}>
                        <h1 className="text-3xl font-bold text-white">The beginning of your conversation with ...</h1>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-2">
                <div className={"flex flex-row"}>
                    <div className="flex" data-testid="input" contentEditable="true" suppressContentEditableWarning={true} onBlur={handleOnBlur} onFocus={handleOnFocus} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-placeholder={placeholderText}>{placeholderText}</div>
                    <button className={`border hover:cursor-pointer h-full ${isButtonDisabled() ? "bg-transparent" : "bg-white hover:bg-[#eee]"}`} data-testid="submit" onClick={handleReturn} disabled={isButtonDisabled()}>
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