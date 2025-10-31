import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export default function Matches({ token, acceptedMatches }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setMatches([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`${API_BASE_URL}matches/`, {
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json",
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Matches data fetched:", data);
            // Filter out users that have been accepted (they're now in acceptedMatches)
            const filteredMatches = (data.matches || []).filter(
                match => !acceptedMatches.some(accepted => accepted.id === match.id)
            );
            setMatches(filteredMatches);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            setError(err.message);
        })
        .finally(() => setLoading(false));
    }, [token, acceptedMatches]);

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

                {acceptedMatches.map(match => (
                    <div
                        key={match.id}
                        className="w-full p-4 rounded-lg bg-white/80 text-gray-800 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            {match.profile_image ? (
                                <img 
                                    src={match.profile_image} 
                                    alt={match.username}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-6 w-6 text-gray-500" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                        />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="font-semibold">{match.username}</div>
                                {match.age && (
                                    <div className="text-sm text-gray-600">{match.age} years old</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}