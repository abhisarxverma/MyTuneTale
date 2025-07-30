from fastapi import FastAPI, Request, Header
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from spotipy import Spotify, SpotifyException
from spotipy.oauth2 import SpotifyOAuth
from decouple import config
from supabase import create_client, Client
from middleware import RateLimitMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta

from utils import fetch_all_saved_tracks, fetch_all_top_tracks, fetch_all_top_artists, fetch_all_playlists, fetch_user_details, send_email, check_limit, is_clean_text, create_playlist_with_image
from base import createStory
from wordcloud_image import make_wordcloud

import asyncio
from urllib.parse import quote
from URLDecoder.decoder import URLDecoder
decoder = URLDecoder()
import json, os

CLIENT_ID = config("SF_CLIENT_ID")
CLIENT_SECRET = config("SF_CLIENT_SECRET")
REDIRECT_URI = config("REDIRECT_URI")
SCOPE = "user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-recently-played user-read-email user-read-private playlist-modify-public playlist-modify-private ugc-image-upload"
TOKEN_SESSION_KEY = "spotify_token_info"

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

ENV = config("ENV", default="DEV")
FRONTEND_URL = config("FRONTEND_URL", default="/")

def debugPrint(m):
    print(f"\n\n\n{m}\n\n\n") 

callback_redirect = f"{FRONTEND_URL}/spotify-callback" if ENV == "DEV" else "/spotify-callback"

debugPrint("CALLBACK REDIRECT :"+callback_redirect)

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="your-secret-key", same_site="none", https_only=False)
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if ENV != "DEV" else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewPayload(BaseModel):
    message: str

templates = Jinja2Templates(directory="templates")

supabase : Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

# @app.middleware("http")
# async def log_request(request: Request, call_next):
#     body = await request.body()
#     print("RAW BODY:", body.decode())
#     return await call_next(request)

def get_spotify_oauth():
    if os.path.exists(".cache"):
        os.remove(".cache")
        
    return SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
        cache_handler=None,
        cache_path=""
    )

def refresh_token_if_expired(token_info: dict):
    if get_spotify_oauth().is_token_expired(token_info):
        print("Access token expired. Attempting to refresh...")
        token_info = get_spotify_oauth().refresh_access_token(token_info["refresh_token"])
        print("Token refreshed successfully")
    return token_info

@app.get("/api/connect-spotify")
async def login(request: Request):

    given_token_info = request.query_params.get("token_info", None)

    token_info = None

    if given_token_info:
        try:
            decoded_info = decoder.to_dict(given_token_info)
            print("GIVEN TOKEN INFO TO CONNECT SPOTIFY :", decoded_info)
            token_info = decoded_info
        except json.JSONDecodeError:
            pass

    if token_info:
        print("TOKEN INFO TYPE :", type(token_info))
        new_token_info = refresh_token_if_expired(token_info)
        access_token = new_token_info.get("access_token")
        sp = Spotify(auth=access_token)
        user = sp.current_user()
        username = user["display_name"]
        user_id = user["id"]
        debugPrint(f"USER REQUESTED TO CONNECT SPOTIFY : {username}, ID : {user_id}")
        debugPrint("Token is validated, redirecting to callback")
        encoded_data = quote(json.dumps((new_token_info)))
        encoded_user_id = quote(user_id)
        redirect_url = f"{callback_redirect}?token_info={encoded_data}&user_id={encoded_user_id}"
        return RedirectResponse(url=redirect_url)

    auth_url = get_spotify_oauth().get_authorize_url()
    debugPrint("Redirecting to Spotify authorization URL:"+auth_url)
    return RedirectResponse(url=auth_url)

@app.get("/callback")
def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        print("Missing code in callback request returning error in url")
        return RedirectResponse(url=callback_redirect)

    token_info = get_spotify_oauth().get_access_token(code, as_dict=True)
    sp = Spotify(auth=token_info.get("access_token"))
    user = fetch_user_details(sp)
    user_id = user.get("id")
    username = user.get("display_name")
    debugPrint(f"Authenticating user : {username}")
    encoded_user_id = quote(user_id)
    print("TOKEN INFO RECEIVED FROM SPOTIFY :", token_info)
    encoded_info = quote(json.dumps((token_info)))
    redirect_url = f"{callback_redirect}?token_info={encoded_info}&user_id={encoded_user_id}"
    return RedirectResponse(url=redirect_url)

@app.post("/api/me/")
async def user_spotify_data(request: Request):

    body = await request.json()

    print("RAW BODY IN ME :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })
    
    access_token = token_info.get("access_token", None)

    sp = Spotify(auth=access_token)

    try:
        user_profile = sp.current_user()
        user_id = user_profile["id"]
    except SpotifyException as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

    try:
        existing_data = give_from_supabase(user_id, "data")
        if existing_data:
            return JSONResponse({
                "success": True,
                "message": "User data returned from Supabase",
                "data": existing_data,
            })
        print("User last updated at 10 days ago, so fetching fresh data from Spotify")
    except Exception as e:
        pass

    try:
        data = {
            "user": fetch_user_details(sp),
            "saved_tracks": fetch_all_saved_tracks(sp),
            "top_tracks": fetch_all_top_tracks(sp),
            "top_artists": fetch_all_top_artists(sp),
            "playlists": fetch_all_playlists(sp),
        }
        if data["saved_tracks"]:
            data["playlists"].append({"name" : "Liked Songs", "tracks": data["saved_tracks"]})

        try:
            response = supabase.table("users").upsert({"id": user_id, "data": data}).execute()
            print("Fetched new data from the spotify and updated the supabase")
        except Exception as e:
            pass

        return JSONResponse({
            "success": True,
            "message": "Fresh data fetched from Spotify",
            "data": data,
        })

    except SpotifyException as e:
        print("Failed to fetch Spotify data :"+str(e))
        return JSONResponse(status_code=500, content={
            "success": False,
            "message": f"Failed to fetch Spotify data : {str(e)}",
            "data": None
        })

@app.post("/api/user/")
async def user_profile(request: Request):

    body = await request.json()

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })
    
    user_id = body.get("user_id", None)
    print("USER ID for profile:", user_id)

    if user_id:
        try:
            existing_data = give_from_supabase(user_id, "user")
            if existing_data:
                return JSONResponse({
                    "success": True,
                    "message": "User data returned from Supabase",
                    "data": existing_data,
                })
        except Exception as e:
            pass

    access_token = token_info.get("access_token", None)

    print("Fetching fresh user data from Spotify")

    sp = Spotify(auth=access_token)

    try:
        user_profile = fetch_user_details(sp)
        
        res = save_in_supabase(user_id, "user", user_profile)
            
        return JSONResponse(status_code=200, content={
            "success": True,
            "message" : "Successfully fetched user data and updated supabase",
            "data" : user_profile
        })
    except Exception as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })
    
@app.post("/api/top_tracks/")
async def user_top_tracks(request: Request):

    body = await request.json()

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_supabase(user_id, "top_tracks")
            if existing_data:
                return JSONResponse({
                    "success": True,
                    "message": "top tracks data returned from Supabase",
                    "data": existing_data,
                })
        except Exception as e:
            pass
    
    access_token = token_info.get("access_token", None)


    print("Fetching fresh top tracks data from Spotify")

    sp = Spotify(auth=access_token)

    try:
        top_tracks = fetch_all_top_tracks(sp)

        res = save_in_supabase(user_id, "top_tracks", top_tracks)

        return JSONResponse(status_code=200, content={
            "success": True,
            "message" : "Successfully fetched user top tracks data and updated supabase",
            "data" : top_tracks
        })
    except SpotifyException as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })
    
@app.post("/api/top_artists/")
async def user_top_artists(request: Request):

    body = await request.json()

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_supabase(user_id, "top_artists")
            if existing_data:
                return JSONResponse({
                    "success": True,
                    "message": "top artists data returned from Supabase",
                    "data": existing_data,
                })
        except Exception as e:
            pass
    
    access_token = token_info.get("access_token", None)


    print("Fetching fresh top artists data from Spotify")

    sp = Spotify(auth=access_token)

    try:
        top_artists = fetch_all_top_artists(sp)

        res = save_in_supabase(user_id, "top_artists", top_artists)

        return JSONResponse(status_code=200, content={
            "success": True,
            "message" : "Successfully fetched user top artists data and upadated supabase",
            "data" : top_artists
        })
    except SpotifyException as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })
    
@app.post("/api/playlists/")
async def user_playlists(request: Request):

    body = await request.json()

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_supabase(user_id, "playlists")
            if existing_data:
                return JSONResponse({
                    "success": True,
                    "message": "Playlists data returned from Supabase",
                    "data": existing_data,
                })
        except Exception as e:
            pass
    
    access_token = token_info.get("access_token", None)

    print("Fetching fresh playlists data from Spotify")

    sp = Spotify(auth=access_token)

    try:
        playlists = fetch_all_playlists(sp)
        saved_tracks = fetch_all_saved_tracks(sp)
        playlists.append({"tracks": saved_tracks, "name": "Saved Tracks"})

        res = save_in_supabase(user_id, "playlists", playlists)
        res2 = save_in_supabase(user_id, "saved_tracks", saved_tracks)

        return JSONResponse(status_code=200, content={
            "success": True,
            "message" : "Successfully fetched user playlists data",
            "data" : playlists
        })
    except SpotifyException as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })
    
@app.post("/api/saved_tracks/")
async def user_playlists(request: Request):

    body = await request.json()

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JSONResponse(content={
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_supabase(user_id, "saved_tracks")
            if existing_data :
                return JSONResponse({
                    "success": True,
                    "message": "Saved Tracks data returned from Supabase",
                    "data": existing_data,
                })
        except Exception as e:
            pass
    
    access_token = token_info.get("access_token", None)

    print("Fetching fresh Saed tracks data from Spotify")

    sp = Spotify(auth=access_token)

    try:
        saved_tracks = fetch_all_saved_tracks(sp)

        res = save_in_supabase(user_id, "saved_tracks", saved_tracks)

        return JSONResponse(status_code=200, content={
            "success": True,
            "message" : "Successfully fetched saved tracks.",
            "data" : saved_tracks
        })
    except SpotifyException as e:
        print("Failed to fetch the user's user id :", str(e))
        return JSONResponse(status_code=401, content={
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@app.post(f"/api/ai_analysis")
async def ai_analysis(request : Request):

    body = await request.json()
    print("Received data for AI analysis:", body)
    id = body.get("user_id", "")
    if not id:
        return JSONResponse(status_code=400, content={"success": False, "message": "User ID is required", "data" : None})
    
    try:
        existing_analysis = give_from_supabase(id, "ai_analysis")
        if existing_analysis :
             return JSONResponse(status_code=200, content={
                "success": True,
                "message": "Fetched ai analysis from the supabase",
                "data": existing_analysis
            })
    except Exception as e:
        pass
    
    
    try:
        if not check_limit(request, "ai_analysis"):
            print("Rate limit exceeded for AI analysis")
            return JSONResponse(status_code=429, content={"success": False, "message": "Rate limit exceeded. Try again later.", "data": None })
        
        response = supabase.table("users").select("user", "top_tracks", "top_artists", "playlists", "saved_tracks").eq("id", id).execute()

        data = response.data

        if not data:
            return JSONResponse(status_code=404, content={
                "success" : False,
                "message" : "Data not found in supabase",
                "data" : None
            })

        print("Trying to create the ai analysis")
        story = createStory(data)
        if not story:
            return JSONResponse(status_code=500, content={"success": False, "message": "Failed to generate AI analysis", "data" : None})
        else :
            print("AI analysis generated successfully")
            
            res = save_in_supabase(id, "ai_analysis", story)

            return JSONResponse(status_code=200, content={
                "success": True,
                "message": "AI analysis generated successfully",
                "data": story
            })
    
    except Exception as e:
        print("Error Occured : ", e)
        return JSONResponse(status_code=500, content={"success": False, "message": f"Failed to generate AI analysis: {str(e)}", "data": None})

@app.post("/api/wordcloud")
async def create_wordcloud(request: Request):
    body = await request.json()
    user_id = body.get("user_id", "")
    if not user_id: return JSONResponse(status_code=400, content={"success": False, "message" : f"User ID is required", "data": None})

    top_tracks = body.get("top_tracks", None)
    if not top_tracks: return JSONResponse(status_code=400, content={"success": False, "message" : "Top tracks data is required", "data": None})

    wordcloud_supabase_url = make_wordcloud(user_id, top_tracks)

    print("WORDCLOUD URL :", wordcloud_supabase_url)

    return JSONResponse(status_code=200, content={
        "success": True,
        "message" : "Wordcloud successfully created",
        "data" : {"url" : wordcloud_supabase_url}
    })

@app.post("/api/review")
async def send_review(review: ReviewPayload):
    try:
        message = review.message
        print("Received review message:", message)
        if not message:
            return JSONResponse(status_code=400, content={"success": False, "message": "Message is required"})

        if not is_clean_text(message):
            return JSONResponse(status_code=400, content={"success": False, "message": "Message contains invalid characters"})
        
        send_email(message)
        return JSONResponse(status_code=200, content={"success": True, "message": "Review submitted successfully"})

    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": f"Failed to submit review: {str(e)}"})

@app.post("/api/create_playlist/")
async def create_playlist(request: Request):
    
    body = await request.json()

    access_token = body.get("access_token", None)
    term = body.get("term", "long_term")
    name = body.get("name", None)
    description = body.get("description", None)

    if not access_token: 
        return JSONResponse(status_code=400, content={
            "success" : False,
            "message" : "Data is not complete to create playlist",
            "cause" : "missing",
            "data" : None
        })
    
    try:
        sp = Spotify(auth=access_token)
        user_id = sp.current_user()["id"]
    except Exception as e:
        print(f"Spotify section error in create playlist : {e}")
        return JSONResponse(status_code=301, content={
            "success" : False,
            "message" : "Access token is invalid, please authorize again",
            "cause" : "token",
            "data" : None
        })
    
    try:
        response = supabase.table("users").select("top_tracks").eq("id", user_id).single().execute()
        top_tracks = response.data.get("top_tracks")

        songs = [track.get("uri") for track in top_tracks.get(term)]

        playlist_url = create_playlist_with_image(sp, user_id, songs, playlist_name=name, description=description)

        print("Playlist created : ", playlist_url)

        return JSONResponse(status_code=200, content={
            "success" : True,
            "message" : "New playlist created successfully",
            "data" : playlist_url
        })
    
    except Exception as e:
        print(f"Error occured in creating Playlist :{e}")
        return JSONResponse(status_code=500, content={
            "success" : False,
            "message" : f"Error occured in creating playlist {e}",
            "cause" : "server",
            "data" : None
        })

if ENV == "PROD":
    app.mount("/static", StaticFiles(directory="static", html=True), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("/api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse("static/index.html")


def give_from_supabase(user_id, column_name):
    try:
        raw_updated_at = supabase.table("users").select("updated_at").eq("id", user_id).single().execute()   
        if raw_updated_at.data and raw_updated_at.data.get("updated_at"):
            updated_at = raw_updated_at.data["updated_at"]
            print(f"User {user_id} data last updated at:", updated_at)
            if updated_at and datetime.now() - datetime.fromisoformat(updated_at).replace(tzinfo=None) < timedelta(days=5): 
                result = supabase.table("users").select(column_name).eq("id", user_id).single().execute()
                # print(f"Result from the supabase for {column_name} :", result)
                if result.data and result.data.get(column_name):
                    print("Returning existing spotify data from the supabase")
                    return result.data[column_name]

        return None

    except Exception as e:
        print("Error occured in checking in supabase function :", e)
        return None
    

def save_in_supabase(user_id, column_name, data):
    try:
        response = supabase.table("users").upsert({"id": user_id, column_name: data}).execute()
        print(f"Saved data in {column_name} in supabase")
        return True

    except Exception as e:
        print(f"Error occured in saving in supabase in {column_name}: {e}")
        return False