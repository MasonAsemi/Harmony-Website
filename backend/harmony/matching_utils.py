from .models import (
    UserGenrePreference,
    UserArtistPreference,
    UserSongPreference
)
# calculates a similarity score btwn 0 and 1 for song, genre, artist and compute final similarity score taking weigts into account
def compute_weighted_similarity(model, field_name, user_a, user_b):

    a_prefs = model.objects.filter(user=user_a)
    b_prefs = model.objects.filter(user=user_b)

    a_dict = {getattr(pref, f"{field_name}_id"): pref.weight for pref in a_prefs}
    b_dict = {getattr(pref, f"{field_name}_id"): pref.weight for pref in b_prefs}

    # things in common
    shared_items = set(a_dict.keys()) & set(b_dict.keys())
    if not shared_items:
        return 0.0

    # pick the lowest preference for each matching thing
    numerator = sum(min(a_dict[item], b_dict[item]) for item in shared_items)
    denominator = sum(a_dict.values()) + sum(b_dict.values())

    similarity = (2 * numerator) / denominator
    return round(similarity, 3)

def compute_genre_similarity(user_a, user_b):
    return compute_weighted_similarity(UserGenrePreference, "genre", user_a, user_b)

def compute_artist_similarity(user_a, user_b):
    return compute_weighted_similarity(UserArtistPreference, "artist", user_a, user_b)

def compute_song_similarity(user_a, user_b):
    return compute_weighted_similarity(UserSongPreference, "song", user_a, user_b)

def compute_final_match_score(
    user_a, 
    user_b, 
    genre_weight=1.0, 
    artist_weight=1.0, 
    song_weight=1.0
):

    genre_sim = compute_genre_similarity(user_a, user_b)
    artist_sim = compute_artist_similarity(user_a, user_b)
    song_sim = compute_song_similarity(user_a, user_b)

    score = (
        genre_sim * genre_weight +
        artist_sim * artist_weight +
        song_sim * song_weight
    )

    return round(score, 3)
