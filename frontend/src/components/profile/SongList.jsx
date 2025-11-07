import { useEffect, useState } from "react";
import { deleteUserSong } from "../../api/music";

const SongList = ({ songs, setSongs , numSongs}) => {
    const [showList , setShowList]    = useState(false); // to make sure we're not calling the spotify embed api too much  
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

    useEffect(() =>{
        console.log("Showing songs")
        setShowList(true); 
    }, [])
    return (
    <div>
        <div className="field-title">Favorite song(s):</div>
        {songs.length < 1 ? null : <ul className="flex flex-col gap-2 border shadow-md p-4 overflow-y-auto max-h-48">
            {songs.map((song, index) => {

                const limit = numSongs > 0 ? numSongs : 1  
                if(song && song.embed && song.embed.html && showList && index < limit ){
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