import "../styles/profile.css";
import ChatsList from "../components/chats/ChatsList";
import Chat from "./Chat";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const exampleChats = [
    {
        recipient: "Example1"
    }, 
    {
        recipient: "Example2"
    }
]

function Dashboard() {
    const [currentChat, setCurrentChat] = useState(null);

    return (
        <div className="flex flex-row h-screen bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500">
            <Sidebar />
            <div className="flex-1 ml-16 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    {
                        (currentChat == null) ?
                        (<ChatsList userChats={exampleChats} />) :
                        (<Chat conversation={currentChat} />)
                    }
                </div>
            </div>
        </div>
    );
}

export default Dashboard;