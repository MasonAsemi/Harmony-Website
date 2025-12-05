import { API_BASE_URL } from '../../config';

const ProfileImage = ({ profileData }) => {
    return (
        <div className="flex-1 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center min-h-0">
            {profileData?.profile_image ? (
                <img 
                    src={profileData.profile_image}
                    alt={profileData.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                            <div class="text-center text-gray-500">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class="h-20 w-20 mx-auto mb-2 opacity-50" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        stroke-width="1" 
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                    />
                                </svg>
                                <p class="text-sm">No Profile Image</p>
                            </div>
                        `;
                    }}
                />
            ) : (
                <div className="text-center text-gray-500">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-20 w-20 mx-auto mb-2 opacity-50" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                        />
                    </svg>
                    <p className="text-sm">No Profile Image</p>
                </div>
            )}
        </div>
    );
};

const ProfileInfo = ({ profileData }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profileData?.username || 'Your Username'}
                {profileData?.age && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                        , {profileData.age}
                    </span>
                )}
            </h2>

            {profileData?.biography && (
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">{profileData.biography}</p>
            )}

            {profileData?.location && (
                <p className="text-gray-600 text-sm mb-2">📍 {profileData.location}</p>
            )}

            {/* Favorite song */}
            {profileData?.fav_songs && profileData.fav_songs.length > 0 && (
                <div className="mb-2">
                    <h3 className="text-xs font-semibold text-gray-600 mb-1">
                        Favorite Song
                    </h3>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-full">
                            {(() => {
                                const track = profileData.fav_songs[0];
                                const id = track.spotify_id || track.id;
                                const raw =
                                    track.spotify_url ||
                                    (track.external_urls && track.external_urls.spotify) ||
                                    track.url ||
                                    track.href;

                                let embedUrl = null;
                                if (id) {
                                    embedUrl = `https://open.spotify.com/embed/track/${id}?compact=1`;
                                } else if (typeof raw === 'string') {
                                    const uriMatch = raw.match(/spotify:track:([a-zA-Z0-9]+)/);
                                    const urlMatch = raw.match(/track\/([a-zA-Z0-9]+)/);
                                    const trackId = (uriMatch && uriMatch[1]) || (urlMatch && urlMatch[1]);
                                    if (trackId) embedUrl = `https://open.spotify.com/embed/track/${trackId}?compact=1`;
                                }

                                return embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        width="100%"
                                        height="80"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {track.album_image_url ? (
                                            <img
                                                src={track.album_image_url}
                                                alt={track.name}
                                                className="w-12 h-12 rounded object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {track.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Favorite artists */}
            {profileData?.fav_artists && profileData.fav_artists.length > 0 && (
                <FavoriteArtists profileData={profileData} />
            )}
        </div>
    );
};

const FavoriteArtists = ({ profileData }) => {
    return (
        <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-600 mb-1">
                Top Artists
            </h3>
            <div className="flex flex-wrap gap-1">
                {profileData.fav_artists.slice(0, 3).map(artist => (
                    <span 
                        key={artist.id}
                        className="px-2 py-1 bg-pink-100 text-black-800 rounded-full text-xs"
                    >
                        {artist.name}
                    </span>
                ))}
            </div>
        </div>
    );
};

const MatchCardPreview = ({ profileData }) => {
    return (
        <div className="w-full h-full">
            <div className="rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col" style={{backgroundColor: 'white'}}>
                {/* Profile image - takes up remaining space */}
                <ProfileImage profileData={profileData} />

                {/* Profile info - compact, fixed at bottom */}
                <div className="flex-shrink-0">
                    <ProfileInfo profileData={profileData} />
                </div>
            </div>
        </div>
    );
};

export default MatchCardPreview;