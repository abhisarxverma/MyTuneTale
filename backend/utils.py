import smtplib
from decouple import config
from fastapi import Request
from collections import defaultdict
import time
import re

email = config("EMAIL")
password = config("PASSWORD")

CUSTOM_PROFANE_WORDS = config("CUSTOM_PROFANITY").split(",")

BAD_WORDS = [word.strip() for word in CUSTOM_PROFANE_WORDS if word.strip()]


rate_limit_cache = defaultdict(lambda: {"count": 0, "timestamp": time.time()})

MAX_LIMIT = 5
TIME_WINDOW = 86400 

def check_limit(request: Request, key: str) -> bool:
    ip = get_client_ip(request)
    cache_key = f"{key}:{ip}"
    current_time = time.time()

    entry = rate_limit_cache[cache_key]

    if current_time - entry["timestamp"] > TIME_WINDOW:
        entry["count"] = 1
        entry["timestamp"] = current_time
    else:
        entry["count"] += 1

    cleanup_cache(current_time)

    return entry["count"] <= MAX_LIMIT

def cleanup_cache(current_time: float):
    expired_keys = [
        key for key, val in rate_limit_cache.items()
        if current_time - val["timestamp"] > TIME_WINDOW
    ]
    for key in expired_keys:
        del rate_limit_cache[key]

def get_client_ip(request: Request) -> str:
        forwarded = request.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0]
        return request.client.host

def is_clean_text(text):
    text = text.lower()

    for pattern in BAD_WORDS:
        pattern = pattern.strip().lower()

        if ' ' in pattern:
            if pattern in text:
                return False
        else:
            regex = re.compile(r'\b' + re.escape(pattern) + r'\b')
            if regex.search(text):
                return False

    return True

def debugPrint(data) :
    print(f"\n\n\n{data}\n\n\n")

def send_email(message):
    if  not message :
        return False
    else:
        try:
            with  smtplib.SMTP('smtp.gmail.com') as connection:
                connection.starttls()
                connection.login(user=email, password=password)
                connection.sendmail(from_addr=email,
                                    to_addrs="abhisarverma163@gmail.com",
                                    msg=f'Subject:MyTuneTale Website User Review\n\n{message}')
        except Exception as e :
            return False

        else:
            return True
        

def fetch_all_saved_tracks(sp):
    saved_tracks = []
    offset = 0
    limit = 50

    while True:
        batch = sp.current_user_saved_tracks(limit=limit, offset=offset)
        items = batch['items']
        if not items:
            break
        saved_tracks.extend([
            {
                "name": item['track']['name'],
                "id": item['track']['id'],
                "artist": item['track']['artists'][0]['name'],
                "album": item['track']['album']['name'],
                "image": item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else None,
                "added_at": item['added_at']
            }
            for item in items
        ])
        offset += limit
    return saved_tracks

def fetch_all_top_tracks(sp):
    top_tracks = {}
    offset = 0
    limit = 50

    for term in ["short_term", "medium_term", "long_term"]:
        while True:
            top = sp.current_user_top_tracks(time_range=term, limit=limit, offset=offset)
            items = top["items"]
            if not items: break
            top_tracks[term] = [
                {
                    "name": item['name'],
                    "id": item['id'],
                    "artist": item['artists'][0]['name'],
                    "album": item['album']['name'],
                    "image": item['album']['images'][0]['url'] if item['album']['images'] else None
                }
                for item in items
            ]
            offset += limit
        offset = 0
    
    return top_tracks

def fetch_all_top_artists(sp):
    top_artists = {}
    limit = 50 

    for term in ["short_term", "medium_term", "long_term"]:
        offset = 0
        artists = []

        while True:
            response = sp.current_user_top_artists(time_range=term, limit=limit, offset=offset)
            items = response.get("items", [])
            if not items:
                break

            for item in items:
                artists.append({
                    "id": item["id"],
                    "name": item["name"],
                    "genres": item.get("genres", []),
                    "popularity": item.get("popularity"),
                    "followers": item.get("followers", {}).get("total"),
                    "image_url": item["images"][0]["url"] if item.get("images") else None,
                    "external_url": item.get("external_urls", {}).get("spotify"),
                    "uri": item.get("uri"),
                })

            offset += limit

        top_artists[term] = artists

    return top_artists

def fetch_all_playlists(sp):
    playlists = []
    offset = 0
    limit = 50

    while True:
        response = sp.current_user_playlists(limit=limit, offset=offset)
        items = response["items"]
        if not items:
            break

        for playlist in items:
            playlist_id = playlist["id"]

            playlist_data = {
                "id": playlist_id,
                "name": playlist["name"],
                "description": playlist.get("description", ""),
                "owner": playlist["owner"]["display_name"],
                "collaborative": playlist["collaborative"],
                "public": playlist["public"],
                "total_tracks": playlist["tracks"]["total"],
                "image": playlist["images"][0]["url"] if playlist["images"] else None,
                "tracks": []
            }

            track_offset = 0
            track_limit = 100  

            while True:
                track_response = sp.playlist_items(
                    playlist_id,
                    limit=track_limit,
                    offset=track_offset,
                    additional_types=["track"]
                )
                track_items = track_response["items"]
                if not track_items:
                    break

                for item in track_items:
                    track = item.get("track")
                    if not track or not track.get("id"):
                        continue

                    playlist_data["tracks"].append({
                        "id": track["id"],
                        "name": track["name"],
                        "artist": track["artists"][0]["name"],
                        "album": track["album"]["name"],
                        "image": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                        "added_at": item.get("added_at")  
                    })

                track_offset += track_limit

            if playlist_data["tracks"] : playlists.append(playlist_data)

        offset += limit

    return playlists

def fetch_user_details(sp):
    user_data = sp.current_user()

    # Extract useful details
    user_info = {
        "display_name": user_data.get("display_name"),
        "email": user_data.get("email"),
        "id": user_data.get("id"),
        "country": user_data.get("country"),
        "product": user_data.get("product"), 
        "profile_image": user_data.get("images")[0]["url"] if user_data.get("images") else None,
        "followers": user_data.get("followers", {}).get("total"),
        "external_url": user_data.get("external_urls", {}).get("spotify")
    }

    return user_info


def sort_genres(tracks: list):

    genre_count = {}

    for track in tracks:

        genre = track["genre_tag"]

        if genre in genre_count:
            genre_count[genre] += 1

        else :
            genre_count[genre] = 1

    genre_count = dict(sorted(genre_count.items(), reverse=True))

    return genre_count

def give_prompt(data):

    prompt = f"""
    You are an expert emotional music analyst. Your task is to analyze a user's music listening history and create a structured and emotionally resonant summary based on it.

    You will receive a JSON data payload containing information about a user's saved playlists and tracks. Using this data, generate a Pythonic structured output based on the following specifications:

    1. For each **track** object, predict:
    - `emotion_tag`: A real-life emotion the track evokes, not fancy or buzzy — something that makes a user say, “Oh yes, I’ve felt this.”
    - `genre_tag`: A grounded genre label like soothing, slow, pop, rock — choose descriptive and human-friendly words.
    - These tags must include a color in `color_hex` that visually represents the feeling and genre.

    2. For each **playlist**, calculate:
    - `sadness_score`: From 0 to 100 — based on the lyrics, vibe, and musical rhythms that express sadness, heartbreak, or melancholy.
    - `happiness_score`: From 0 to 100 — measuring how much positivity or uplifting energy the songs convey.
    - `deep_lyrics_score`: From 0 to 100 — how meaningful, heavy, or emotionally layered the lyrics are. Prefer depth over poetic fluff.

    3. Organize all tracks chronologically into **MonthlyChapterOfStory** objects:
    - `month`: Use the "YYYY-MM" format.
    - For each month, generate scores similar to playlists for happiness, sadness, and deep_lyrics.
    - Also, infer the user's overall emotional outlook that month as a `persona_score` from 0 to 100 — where higher means more positive, and lower suggests darker or detached phases.

    4. Create a **Story** object:
    - Aggregate all monthly chapters.
    - Generate a `story_title`: Max 4 words, no buzzwords — must reflect the emotional arc of the user based on the above.
    - Generate a `story_lore`: Two short but impactful lines telling the user’s emotional journey through music. Be direct, poetic, and meaningful — like “You held on until it broke. Now you let silence speak louder. Join the quiet rebellion.”

    5. Finally, compose the **VibeSummary**:
    - `poetic_title`: A 4-word phrase celebrating the user’s unique listening journey — deep, emotive, and poetic.
    - `mood`: Predict the current mood of the user based on what they’ve been listening to.
    - `emotion_keywords`: List up to 3 core emotions the user might be experiencing now.
    - `reflection`: One line that gently reflects the user’s emotional state and growth through this journey.

    Respond ONLY with a JSON that fits this format. Do not include any explanation or commentary.

    Here is the input JSON:
    {data}
    """

    return prompt