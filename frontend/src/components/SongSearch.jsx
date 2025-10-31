import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import harmonyLogo from "../assets/logo.png";
import { addUserSong, getUserSongs, searchSong } from "../api/music";
import SongList from "./SongList";

const SongSearch = () => {
    const [input, setInput] = useState('');
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [cooldown, setCooldown] = useState(false);
    const updateDelayMS = 500;
    const autosearchThreshold = 1;
    const enableAutosearch = true;

    useEffect(() => {
        getUserSongs().then((res) => {
            setSelectedSongs(res.data)
        })
    }, [])

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

    const handleSongSelect = (index) => {
        let updatedSongs = [...songs];
        const selectedSong = updatedSongs.splice(index, 1)[0]
        setSongs(updatedSongs);
        addUserSong(selectedSong)

        let updatedSelectedSongs = [...selectedSongs];
        updatedSelectedSongs.push(selectedSong);
        setSelectedSongs(updatedSelectedSongs)
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
        <SongList songs={selectedSongs} setSongs={setSelectedSongs}/>
    </div>
    );
}

export default SongSearch;