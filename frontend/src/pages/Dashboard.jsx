import "../styles/profile.css";
import ChatsList from "../components/chats/ChatsList";

const exampleChats = [
    {
        recipient: "Example1"
    }, 
    {
        recipient: "Example1"
    }
]

function Dashboard() {

    return (
        <div className="flex flex-row">
            <ChatsList userChats={exampleChats} />
        </div>
    );
}

export default Dashboard;
