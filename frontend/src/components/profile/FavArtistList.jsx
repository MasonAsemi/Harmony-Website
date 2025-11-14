import ArtistCard from "./ArtistCard";

const FavArtistList = ({artistList}) =>{
    return (
    <div className='content-field'>
      <div className='field-title'>
        <h1>Favorite Artists</h1>
        
      </div>
      <ul className="horizontal-list-container">
        {artistList.map((artist , index)=>{
            return(
                <ArtistCard artist= {artist} />
            )
        })}
      </ul>
    </div>
    ); 
}

export default FavArtistList; 