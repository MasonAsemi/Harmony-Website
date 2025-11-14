const GenreCard = ({genre})=>{
    return (
        <li className="genre-card">
            <div className='card-text'>
                {genre?.name}
            </div>
        </li>
    )
}


export default GenreCard; 