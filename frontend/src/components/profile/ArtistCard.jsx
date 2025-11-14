const ArtistCard = ({artist})=>{
    const defaultImageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
    return (
        <li className="artist-card">
            <img
                src={artist.image_url || defaultImageUrl}
            /> 
            <div className='card-text'>
                {artist?.name}
            </div>
        </li>
    )
}


export default ArtistCard; 