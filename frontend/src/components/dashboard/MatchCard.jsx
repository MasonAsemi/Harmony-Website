import { useEffect, useState } from "react";
import { getMatches, getAcceptedMatches, acceptMatch, rejectMatch } from "../../api/matches";

const ProfileImage = ({ currentMatch }) => {
    return (
    <div className="aspect-3/4 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        {currentMatch.profile_image ? (
            <img 
                src={currentMatch.profile_image} 
                alt={currentMatch.username}
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="text-center text-gray-500">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-32 w-32 mx-auto mb-4 opacity-50" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                </svg>
                <p className="text-lg">No Profile Image</p>
            </div>
        )}
    </div>)
}

const ProfileInfo = ({ currentMatch }) => {
    return (
    <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentMatch.username}
            {currentMatch.age && (
                <span className="text-xl font-normal text-gray-600 ml-2">
                    , {currentMatch.age}
                </span>
            )}
        </h2>

        {currentMatch.biography && (
            <p className="text-gray-700 mb-4">{currentMatch.biography}</p>
        )}

        {currentMatch.location && (
            <p className="text-gray-600 mb-4">📍 {currentMatch.location}</p>
        )}

        {/* Favorite song */}
        {currentMatch.fav_songs && currentMatch.fav_songs.length > 0 && (
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Favorite Song
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {currentMatch.fav_songs[0].album_image_url ? (
                        <img 
                            src={currentMatch.fav_songs[0].album_image_url} 
                            alt={currentMatch.fav_songs[0].name}
                            className="w-16 h-16 rounded object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-8 w-8 text-gray-500" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                                />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                            {currentMatch.fav_songs[0].name}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Favorite artists */}
        {currentMatch.fav_artists && currentMatch.fav_artists.length > 0 && (
            <FavoriteArtists />
        )}

        {/* Action buttons */}
        <ActionButtons />
    </div>)
}

const FavoriteArtists = ({ currentMatch }) => {
    return (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Top Artists
        </h3>
        <div className="flex flex-wrap gap-2">
            {currentMatch.fav_artists.slice(0, 3).map(artist => (
                <span 
                    key={artist.id}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                >
                    {artist.name}
                </span>
            ))}
        </div>
    </div>)
}

const ActionButtons = () => {
    return (
    <div className="flex justify-center gap-4 mt-6">
        <button 
            type="button" 
            onClick={handleDecline} 
            className="w-40 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        >
            ✖ Reject
        </button>
        <button 
            type="button" 
            onClick={handleAccept} 
            className="w-40 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
            ✓ Accept
        </button>
    </div>)
}

const MatchCard = ({ token, acceptedMatches, setAcceptedMatches }) => {
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return <div className="w-full max-w-md">
        <div className={`bg-white rounded-2xl shadow-2xl p-8 ${(loading || error || currentMatch ? "text-center" : "overflow-hidden")}`}>
            {loading ? (
                <p className="text-gray-600">Loading matches...</p>
            ) : error ? (
                <p className="text-red-600">Error: {error}</p>
            ) : !currentMatch ? (
                <p className="text-gray-600">No more matches available</p>
            ) : (
                <div>
                    {/* Profile image */}
                    <ProfileImage />

                    {/* Profile info */}
                    <ProfileInfo />
                </div>
            )}
        </div>
    </div>
}

export default MatchCard;