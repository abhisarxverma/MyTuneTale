from flask import Flask, request, session, redirect, url_for, jsonify
from flask_cors import CORS
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler
from decouple import config
from datetime import timedelta
from utils import fetch_all_playlists,fetch_all_saved_tracks, fetch_all_top_artists, fetch_all_top_tracks, fetch_user_details

CLIENT_ID = config("SF_CLIENT_ID")
CLIENT_SECRET = config("SF_CLIENT_SECRET")
REDIRECT_URI = config("REDIRECT_URI")
SCOPE = "user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-recently-played user-read-email user-read-private"
TOKEN_SESSION_KEY = "_SPOTIFY_TOKEN_INFO"

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

ENV = config("ENV", default="DEV")
FRONTEND_URL = config("FRONTEND_URL", default="/")

cache_handler = FlaskSessionCacheHandler(session)

callback_redirect = f"{FRONTEND_URL}/spotify-callback" if ENV == "DEV" else "/spotify-callback"

def get_cache_handler():
    return FlaskSessionCacheHandler(session)

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        cache_handler=get_cache_handler(),
        show_dialog=True,
        scope=SCOPE
    )

def refresh_token_if_expired(token_info: dict):
    if get_spotify_oauth().is_token_expired(token_info):
        print("Access token expired. Attempting to refresh...")
        token_info = get_spotify_oauth().refresh_access_token(token_info["refresh_token"])
        print("Token refreshed successfully")
    return token_info


sp_oauth = get_spotify_oauth()
sp = Spotify(auth_manager=sp_oauth)


app = Flask(__name__)
app.secret_key = "abhisarvermaflaskkey"
app.permanent_session_lifetime = timedelta(days=30)

app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,
)


CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

@app.route("/api/connect-spotify/")
def home():
    print("INCOMING SESSION IN THE GET DATA :", session)
    return redirect(sp_oauth.get_authorize_url())

@app.route("/callback")
def callback():
    token_info = sp_oauth.get_access_token(request.args.get("code"))
    session[TOKEN_SESSION_KEY] = token_info
    session.modified = True
    session.permanent = True
    return redirect(callback_redirect)

@app.route("/api/me/")
def get_data():
    print("INCOMING SESSION IN THE GET DATA :", session)
    token_info = get_cache_handler().get_cached_token()
    print(f"Cached token exists: {bool(token_info)}")
    
    if token_info:
        print(f"Token expired: {sp_oauth.is_token_expired(token_info)}")
        print(f"Token keys: {list(token_info.keys())}")
    

    data = {
        "user": fetch_user_details(sp),
        "saved_tracks": fetch_all_saved_tracks(sp),
        "top_tracks": fetch_all_top_tracks(sp),
        "top_artists": fetch_all_top_artists(sp),
        "playlists": fetch_all_playlists(sp),
    }
    if data["saved_tracks"]:
        data["playlists"].append({"name" : "Liked Songs", "tracks": data["saved_tracks"]})

    return jsonify({
        "success": True,
        "message": "Fresh data fetched from Spotify",
        "data": data,
    })

@app.route("/api/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/api/setsession")
def test_session():
    print("INCOMING SESSION :", session)
    if 'test' in session:
        return jsonify({"message" : f"Session works! Value: {session['test']}"})
    else:
        session['test'] = 'hello world'
        session.permanent = True
        session.modified = True
        return jsonify({"message" : "Session set, refresh to test"})


if __name__ == "__main__":
    app.run(port=8000, debug=True)