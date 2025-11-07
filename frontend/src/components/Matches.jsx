import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../components/auth/AuthContext"; // adjust path if different

export default function Matches({ token, acceptedMatches = [] }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // get current user (may be null)

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        // Since acceptedMatches is passed as prop and managed by parent,
        // we just need to handle loading state
        setLoading(false);
    }, [token, acceptedMatches]);

    const getOtherUsername = (match) => {
        // prefer numeric id comparison if available
        if (user && match.user1_id != null && match.user2_id != null) {
            return match.user1_id === user.id ? match.user2_username : match.user1_username;
        }
        // fall back to username string compare
        if (user && user.username) {
            if (match.user1_username === user.username) return match.user2_username;
            if (match.user2_username === user.username) return match.user1_username;
        }
        // final fallback: try common fields or username-like fields
        return match.user2_username || match.user1_username || match.username || "Unknown";
    };

    return (
        <div className="w-80 mr-8 bg-pink-200 border-l border-white/20 flex flex-col">
            <div className="p-4 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white text-center">Accepted Matches</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading && <p className="text-white text-center">Loading matches...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {!loading && !error && acceptedMatches.length === 0 && (
                    <p className="text-white text-center">No matches yet. Start swiping!</p>
                )}

                {!loading && !error && acceptedMatches.map(match => {
                    const otherName = getOtherUsername(match);
                    return (
                        <div
                            key={match.id}
                            className="w-full p-4 rounded-lg bg-white/80 text-gray-800 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="font-semibold">{otherName}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}