import "../styles/profile.css";
import ChatsList from "../components/chats/ChatsList";
import Chat from "./Chat";
import DashboardNav from "../components/DashboardNav";
import { useState } from "react";

const exampleChats = [
    {
        recipient: "Example1"
    }, 
    {
        recipient: "Example1"
    }
]

function Dashboard() {
    const [currentChat, setCurrentChat] = useState(null);

    return (
        <div className="flex flex-row p-4 gap-x-4">
            <div className="flex w-1/4">
                <DashboardNav>
                    <button className="bg-white w-full">Nav 1</button>
                    <button>Nav 2</button>
                </DashboardNav>
            </div>
            {
                <div className="flex grow">{
                    (currentChat == null) ?
                    (<ChatsList userChats={exampleChats} />) :
                    (<Chat conversation={currentChat} />)
                }</div>
            }
        </div>
    );
}

export default Dashboard;
