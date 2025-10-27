import { useEffect, useState } from "react";
import Chat from "./Chat";

const ChatsList = ({ userChats }) => {
    const [currentChats, setCurrentChats] = useState([]);

    useEffect(() => {
        if (Array.isArray(userChats))
            setCurrentChats(userChats);
        else
            throw new Error("ChatsList userChats is not an array")
    }, [])

    return <div className="flex flex-col gap-4 w-full">
        <div className="w-full text-center text-white text-xl">Chats</div>
        {
            currentChats.map((item, index) => {
                return <Chat key={index}>{item.recipient}</Chat>
            })
        }
    </div>
}

export default ChatsList;