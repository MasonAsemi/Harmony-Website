import GenreCard from "./GenreCard";
function FavGenreList({ genreList }) {
  return (
    <div className='flex flex-col gap-3 sm:gap-4'>
      <div>
        <h2 
          className='text-lg sm:text-xl font-semibold'
          style={{ color: 'var(--color-teriary)' }}
        >
          Favorite Genres
        </h2>
      </div>
      
      {/* Horizontal scrollable list on mobile, wrapping grid on larger screens */}
      <ul 
        className='flex flex-wrap gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0'
        style={{ scrollBehavior: 'smooth' }}
      >
        {genreList && genreList.length > 0 ? (
          genreList.map((genre, index) => (
            <GenreCard key={index} genre={genre} />
          ))
        ) : (
          <p 
            className='text-sm'
            style={{ color: 'var(--color-secondary)' }}
          >
            No favorite genres added yet
          </p>
        )}
      </ul>
    </div>
  );
}

export default FavGenreList; 