import GenreCard from "./GenreCard";
const FavGenreList = ({genreList}) =>{

    return (
    <div className='content-field'>
      <div className='field-title'>
        <h1>Favorite Genres</h1>
        
      </div>
      <ul className="horizontal-list-container">
        {genreList.map((genre , index)=>{
            return(
                <GenreCard genre= {genre} />
            )
        })}
      </ul>
    </div>
    ); 
}

export default FavGenreList; 