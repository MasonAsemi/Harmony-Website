import { useEffect, useState } from "react";
import { deleteUserSong } from "../../api/music";

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
        <div className="field-title">Favorite songs</div>
        {songs.length < 1 ? null : <ul className="flex flex-col gap-2 border shadow-md p-4 overflow-y-auto max-h-48">
            {songs.map((song, index) => {
                if(song && song.embed && song.embed.html){
                    return (
                        <li key={index} dangerouslySetInnerHTML={{ __html: song.embed.html }} />
                    )
                }
            })}
        </ul>}
    </div>
    );
}

export default SongList;