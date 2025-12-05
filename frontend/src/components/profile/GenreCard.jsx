function GenreCard({ genre }) {
  return (
    <li 
      className='flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-pointer'
      style={{ 
        backgroundColor: 'var(--color-tertiary)',
        color: 'var(--color-text-light)',
        flexShrink: 0
      }}
    >
      {genre?.name}
    </li>
  );
}

export default GenreCard; 