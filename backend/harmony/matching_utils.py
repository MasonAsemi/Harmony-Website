from .models import UserGenrePreference

# Generates a float btwn 0 and 1 for similarity between two users based on genre
def compute_genre_similarity(user_a, user_b):

    # Get both users' genre preferences
    a_prefs = UserGenrePreference.objects.filter(user=user_a)
    b_prefs = UserGenrePreference.objects.filter(user=user_b)

    a_dict = {pref.genre_id: pref.weight for pref in a_prefs}
    b_dict = {pref.genre_id: pref.weight for pref in b_prefs}

    # Find shared genres
    shared_genres = set(a_dict.keys()) & set(b_dict.keys())
    if not shared_genres:
        return 0.0  

    numerator = sum(min(a_dict[g], b_dict[g]) for g in shared_genres)
    denominator = sum(a_dict.values()) + sum(b_dict.values())

    similarity = (2 * numerator) / denominator
    return round(similarity, 3)
