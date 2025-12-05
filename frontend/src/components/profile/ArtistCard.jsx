function ArtistCard({ artist }) {
  const defaultImageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
  
  return (
    <li 
      className='flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer'
      style={{ 
        backgroundColor: 'var(--color-secondary)',
        flexShrink: 0
      }}
    >
      <img
        src={artist?.image_url || defaultImageUrl}
        alt={artist?.name}
        className='w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover'
        style={{ 
          border: '2px solid var(--color-accent)'
        }}
      />
      <div 
        className='text-xs sm:text-sm font-medium text-center'
        style={{ color: 'var(--color-tertiary)' }}
      >
        {artist?.name}
      </div>
    </li>
  );
}

export default ArtistCard; 