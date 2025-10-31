import { useEffect, useState } from "react";
import { deleteUserSong } from "../api/music";

const SongList = ({ songs, setSongs }) => {
    const handleClick = async (index) => {
        let updatedSongs = [...songs];
        const removedSong = updatedSongs.splice(index, 1)
        try {
            const res = await deleteUserSong(removedSong);
            if (res.status == 200)
            {
                setSongs(updatedSongs);
            } 
            else
            {
                throw new Error("Could not delete song");
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
    <div>
        <div className="field-title">Your songs</div>
        {songs.length < 1 ? null : <div className="flex flex-col gap-2 border shadow-md p-4 overflow-y-auto max-h-48">
            {songs.map((item, index) => {
                return (
                    <button 
                        onClick={() => {handleClick(index)}} 
                        className="hover:bg-[#e77] p-1 text-left flex items-center gap-3" 
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
    </div>
    );
}

export default SongList;