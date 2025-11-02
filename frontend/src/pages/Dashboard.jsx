import "../styles/profile.css";
import Chat from "./Chat";
import Sidebar from "../components/Sidebar";
import Matches from "../components/Matches";
import { useAuth } from "../components/auth/AuthContext";
import { useState, useEffect } from "react";
import { getMatches, getAcceptedMatches, acceptMatch, rejectMatch } from "../api/matches";
import MatchCard from "../components/dashboard/MatchCard";

const exampleChats = [
    { id: 1, recipient: "Example1" },
    { id: 2, recipient: "Example2" }
];

function Dashboard() {
    const [currentChat, setCurrentChat] = useState(null);
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [acceptedMatches, setAcceptedMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();

    // Fetch accepted matches
    const fetchAcceptedMatches = async () => {
        if (!token) return;
        
        try {
            const data = await getAcceptedMatches(token);
            console.log("Fetched accepted matches:", data);
            setAcceptedMatches(data.matches || []);
        } catch (err) {
            console.error("Error fetching accepted matches:", err);
            // Don't set error state here, as this is optional data
        }
    };

    // Fetch potential matches and accepted matches on component mount
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        
        // Fetch both potential matches and accepted matches
        Promise.all([
            getMatches(token),
            getAcceptedMatches(token).catch(err => {
                console.error("Error fetching accepted matches:", err);
                return { matches: [] }; // Return empty array if endpoint doesn't exist yet
            })
        ])
            .then(([potentialData, acceptedData]) => {
                console.log("Fetched potential matches:", potentialData);
                console.log("Fetched accepted matches:", acceptedData);
                setPotentialMatches(potentialData.matches || []);
                setAcceptedMatches(acceptedData.matches || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching matches:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    const currentMatch = potentialMatches[currentMatchIndex];

    const handleDecline = async () => {
        if (!currentMatch) return;

        try {
            await rejectMatch(token, currentMatch.id);
            console.log("Match rejected:", currentMatch.username);
            
            // Move to next match
            if (currentMatchIndex < potentialMatches.length - 1) {
                setCurrentMatchIndex(currentMatchIndex + 1);
            } else {
                // No more matches
                setPotentialMatches([]);
                setCurrentMatchIndex(0);
            }
        } catch (err) {
            console.error("Error rejecting match:", err);
            alert("Failed to reject match. Please try again.");
        }
    };

    const handleAccept = async () => {
        if (!currentMatch) return;

        try {
            await acceptMatch(token, currentMatch.id);
            console.log("Match accepted:", currentMatch.username);
            
            // Add to accepted matches immediately for UI responsiveness
            setAcceptedMatches([...acceptedMatches, currentMatch]);
            
            // Also refresh accepted matches from server to ensure consistency
            fetchAcceptedMatches();
            
            // Move to next match
            if (currentMatchIndex < potentialMatches.length - 1) {
                setCurrentMatchIndex(currentMatchIndex + 1);
            } else {
                // No more matches
                setPotentialMatches([]);
                setCurrentMatchIndex(0);
            }
        } catch (err) {
            console.error("Error accepting match:", err);
            alert("Failed to accept match. Please try again.");
        }
    };

    const handleChatClick = (chat) => {
        // Toggle chat - if clicking the same chat, close it
        if (currentChat?.id === chat.id) {
            setCurrentChat(null);
        } else {
            setCurrentChat(chat);
        }
    };

    return (
        <div className="flex flex-row h-screen bg-linear-to-br from-rose-300 via-pink-400 to-rose-500">
            {/* Sidebar */}
            <Sidebar />
                
            {/* Left sidebar - Chats */}
            <div className="w-80 ml-16 bg-pink-200 border-r border-white/20 flex flex-col">
                <div className="p-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold text-white text-center">Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {exampleChats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => handleChatClick(chat)}
                            className={`w-full p-4 rounded-lg text-left transition-all ${
                                currentChat?.id === chat.id
                                    ? 'bg-white text-gray-900 shadow-lg'
                                    : 'bg-white/80 text-gray-800 hover:bg-white hover:shadow-md'
                            }`}
                        >
                            <div className="font-semibold">{chat.recipient}</div>
                            <div className="text-sm text-gray-600 mt-1">Click to view chat</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex items-center justify-center p-6">
                {currentChat ? (
                    <div className="w-full h-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <Chat conversation={currentChat} />
                    </div>
                ) : (
                    <MatchCard currentMatch={currentMatch} error={error} loading={loading} />
                )}
            </div>

            {/* Right sidebar - Accepted Matches */}
            <Matches token={token} acceptedMatches={acceptedMatches} />
        </div>
    );
}

export default Dashboard;