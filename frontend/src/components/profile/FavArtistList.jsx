import ArtistCard from "./ArtistCard";

function FavArtistList({ artistList }) {
  return (
    <div className='flex flex-col gap-3 sm:gap-4'>
      <div>
        <h2 
          className='text-lg sm:text-xl font-semibold'
          style={{ color: 'var(--color-tertiary)' }}
        >
          Favorite Artists
        </h2>
      </div>
      
      {/* Horizontal scrollable list on mobile, wrapping grid on larger screens */}
      <ul 
        className='flex flex-wrap gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0'
        style={{ scrollBehavior: 'smooth' }}
      >
        {artistList && artistList.length > 0 ? (
          artistList.map((artist, index) => (
            <ArtistCard key={index} artist={artist} />
          ))
        ) : (
          <p 
            className='text-sm'
            style={{ color: 'var(--color-secondary)' }}
          >
            No favorite artists added yet
          </p>
        )}
      </ul>
    </div>
  );
}

export default FavArtistList; 