import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import harmonyLogo from "../assets/logo.png";

const SongSearch = () => {
    const [input, setInput] = useState('');
    const [songs, setSongs] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(input);
    }

    return (
    <div className="content-field">
        <div className="field-title">Search for your favorite songs</div>
        <form onSubmit={handleSubmit} className="flex flex-row">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search..."
                required
                className="border"
            />
        </form>
        {songs.length < 1 ? null : <div className="flex flex-col gap-2 border shadow-md p-4 overflow-y-scroll max-h-48">
            {songs.map((item, index) => {
                return (<div key={index}>{item.song_name}</div>)
            })}
        </div>}
    </div>
    );
}

export default SongSearch;