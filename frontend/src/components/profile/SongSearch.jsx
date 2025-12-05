import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import harmonyLogo from "../../assets/logo.png";
import { addUserSong, getUserSongs, searchSong } from "../../api/music";
import SongList from "./SongList";

const SongSearch = ({ onSongsUpdate }) => {
    const [input, setInput] = useState('');
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [cooldown, setCooldown] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render
    const updateDelayMS = 500;
    const autosearchThreshold = 1;
    const enableAutosearch = true;

    // Load user songs on mount and when refreshKey changes
    useEffect(() => {
        loadUserSongs();
    }, [refreshKey])

    const loadUserSongs = async () => {
        try {
            const res = await getUserSongs();
            console.log('Loaded user songs:', res.data);
            setSelectedSongs(res.data);
        } catch (error) {
            console.error('Error loading user songs:', error);
        }
    };

    const handleOnChange = (e) => {
        const currInput = e.target.value;
        setInput(currInput)
        
        if (!enableAutosearch)
            return;

        if (!cooldown && currInput.length > autosearchThreshold)
        {
            setCooldown(true)
            setTimeout(() => {
                setCooldown(false)
                if (e.target.value.length <= autosearchThreshold)
                {
                    setSongs([])
                }
                else
                {
                    sendQuery(e.target.value)
                }
            }, updateDelayMS)
        }
        else if (currInput.length <= autosearchThreshold)
        {
            setSongs([])
        }
    }

    const sendQuery = async (query) => {
        try {
            const res = await searchSong(query)
            if (res.status == 200)
            {
                setSongs(res.data.songs);
            }
            else
            {
                throw new Error("Song search failed");
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const searchQuery = input;
        sendQuery(searchQuery);
    }

    const handleSongSelect = async (index) => {
        let updatedSongs = [...songs];
        const selectedSong = updatedSongs.splice(index, 1)[0]
        setSongs(updatedSongs);
        
        try {
            await addUserSong(selectedSong);
            
            // Clear the input field and search results
            setInput('');
            setSongs([]);
            
            // Force refresh of selected songs
            setRefreshKey(prev => prev + 1);
            
            // Notify parent component to refresh data (artists and genres)
            if (onSongsUpdate) {
                onSongsUpdate();
            }
        } catch (error) {
            console.error("Error adding song:", error);
        }
    }

    const handleSongsChange = (updatedSongs) => {
        setSelectedSongs(updatedSongs);
        
        // Force refresh
        setRefreshKey(prev => prev + 1);
        
        // Notify parent component to refresh data (artists and genres)
        if (onSongsUpdate) {
            onSongsUpdate();
        }
    }

    return (
    <div className="content-field flex flex-col gap-3">
        <div className="field-title">Search for your favorite songs</div>
        <form onSubmit={handleSubmit} className="flex flex-row">
            <input
                type="text"
                value={input}
                onChange={handleOnChange}
                placeholder="Search..."
                required
                className="border"
            />
        </form>
        {songs.length < 1 ? null : <div className="flex flex-col gap-2 border shadow-md p-4 overflow-y-auto max-h-48">
            {songs.map((item, index) => {
                return (
                    <button 
                        onClick={() => {handleSongSelect(index)}} 
                        className="hover:bg-[#ddd] p-1 text-left flex items-center gap-3" 
                        key={index}
                    >
                        {item.album_image_url && (
                            <img 
                                src={item.album_image_url} 
                                alt={`${item.name} album cover`} 
                                className="w-12 h-12 object-cover rounded"
                            />
                        )}
                        <span>{`${item.name} by ${item.artists[0].name}`}</span>
                    </button>
                )
            })}
        </div>}
        <SongList 
            key={refreshKey} // Force re-render when refreshKey changes
            songs={selectedSongs} 
            setSongs={handleSongsChange} 
            numSongs={3} 
        />
    </div>
    );
}

export default SongSearch;