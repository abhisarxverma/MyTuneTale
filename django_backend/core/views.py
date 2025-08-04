import os, json
from datetime import datetime, timedelta
from urllib.parse import quote, unquote

from django.http import JsonResponse, HttpResponseRedirect, FileResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from decouple import config

from spotipy import Spotify, SpotifyException
from spotipy.oauth2 import SpotifyOAuth
from supabase import create_client, Client

from .utils import (
    fetch_all_saved_tracks, fetch_all_top_tracks, fetch_all_top_artists,
    fetch_all_playlists, fetch_user_details, send_email, check_limit,
    is_clean_text, create_playlist_with_image, debugPrint
)
from URLDecoder.decoder import URLDecoder
decoder = URLDecoder()

CLIENT_ID = config("SF_CLIENT_ID")
CLIENT_SECRET = config("SF_CLIENT_SECRET")
REDIRECT_URI = config("REDIRECT_URI")
SCOPE = "user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-recently-played user-read-email user-read-private playlist-modify-public playlist-modify-private ugc-image-upload"
TOKEN_SESSION_KEY = "spotify_token_info"

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

ENV = config("ENV", default="DEV")
FRONTEND_URL = config("FRONTEND_URL", default="/")

callback_redirect = f"{FRONTEND_URL}/spotify-callback" if ENV == "DEV" else "/spotify-callback"

print("CALLBACK REDIRECT :"+callback_redirect)

supabase : Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

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

MY_ID = "31x5den2q6myr6azxpquyotn6bfa"
TEMP_TOKEN_INFO = {
    "access_token": "BQB1rKRT2MyZ-Nrc0pk3rIsUcK6pKJO6H81avLHWBihgBegOdC08rqYtAeCKqwE9wCmxP1uqnC3ZxB8E1TNfrtrnAXIFHpb3wcDaVdSG-_tFfg1eBrAsWLO7f5LJxgqWyt7laXBgppZyaQdG8oyMNtiYHx4qtX6NSMmIlfyvsS6mQ7X-Svpyo85Rk4GQW3J4TEEMn7syURNdBmLt-_kUtXN7fkD1eUVYb-IxqXj1yRgQdSlY3kirJuAaaC-6i53qQ-eytJ2tELcCrSeWjrptaVOaQTIFUDbrPQgECuxkqTzZXinUlhZAsXOsBTwxSXzHw3gYCho3k69os0yKatadzKBkzQ8", 
    "token_type": "Bearer", 
    "expires_in": 3600, 
    "refresh_token": "AQAvruTQrsE_Pyboxn16f_Z5bY6mKFhqQLsbsl7wMA7k-QZ0tph5DeBMU0duvn3b4rpuQot2ABtoBFRKYBQeZQUZalHAth7fb0lIxv2GijP_8_ynjoNQp2JV9wOm8mt6efY", 
    "scope": "user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-recently-played user-read-email user-read-private playlist-modify-public playlist-modify-private ugc-image-upload", 
    "expires_at": 1754264594}


# modifying the spotify connection to only give my spotify data till the spotify allows me for infinite users, after that anyone can connect their spotify account and see their data
def connect_spotify(request):
    # print("TOKEN INFO ", request.GET)
    # token_info = request.GET.get("token_info")
    # if token_info:
    #     try:
    #         decoded_info = json.loads(unquote(token_info))
    #         token_info = refresh_token_if_expired(decoded_info)
    #         sp = Spotify(auth=token_info.get("access_token"))
    #         user = sp.current_user()
    #         user_id = user["id"]
    #         encoded_data = quote(json.dumps(token_info))
    #         encoded_user_id = quote(user_id)
    #         redirect_url = f"{callback_redirect}?token_info={encoded_data}&user_id={encoded_user_id}"
    #         return HttpResponseRedirect(redirect_url)
    #     except Exception as e:
    #         pass

    # auth_url = get_spotify_oauth().get_authorize_url()
    # return HttpResponseRedirect(auth_url)

    redirect_url = f"{callback_redirect}?token_info={quote(json.dumps(TEMP_TOKEN_INFO))}&user_id={quote(MY_ID)}"
    return HttpResponseRedirect(redirect_url)


def callback(request):
    code = request.GET.get("code")
    if not code:
        return HttpResponseRedirect(callback_redirect)

    token_info = get_spotify_oauth().get_access_token(code, as_dict=True)
    sp = Spotify(auth=token_info.get("access_token"))
    user = fetch_user_details(sp)
    user_id = user.get("id")
    encoded_info = quote(json.dumps(token_info))
    encoded_user_id = quote(user_id)
    redirect_url = f"{callback_redirect}?token_info={encoded_info}&user_id={encoded_user_id}"
    return HttpResponseRedirect(redirect_url)

@csrf_exempt
def user_profile(request):

    body = json.loads(request.body)

    # print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JsonResponse({
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })
    
    user_id = body.get("user_id", None)
    print("USER ID for profile:", user_id)

    if user_id:
        try:
            existing_data = give_from_users_table(user_id, "user")
            if existing_data:
                return JsonResponse({
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

        if not user_profile:
            return JsonResponse({
                "success" : True,
                "message" : "Empty user data",
                "data" : None
            })
        
        res = save_in_users_table(user_id, "user", user_profile)
            
        return JsonResponse({
            "success": True,
            "message" : "Successfully fetched user data and updated supabase",
            "data" : user_profile
        })
    except Exception as e:
        print("Failed to fetch user profile :", str(e))
        return JsonResponse({
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@csrf_exempt    
def user_top_tracks(request):

    body = json.loads(request.body)

    # print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JsonResponse({
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_users_table(user_id, "top_tracks")
            if existing_data:
                return JsonResponse({
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

        if not top_tracks:
            return JsonResponse({
                "success" : True,
                "message" : "Empty top tracks",
                "data" : None
            })

        res = save_in_users_table(user_id, "top_tracks", top_tracks)

        return JsonResponse({
            "success": True,
            "message" : "Successfully fetched user top tracks data and updated supabase",
            "data" : top_tracks
        })
    
    except Exception as e:
        print("Failed to fetch top tracks:", str(e))
        return JsonResponse({
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@csrf_exempt    
def user_top_artists(request):

    body = json.loads(request.body)

    print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JsonResponse({
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_users_table(user_id, "top_artists")
            if existing_data:
                return JsonResponse({
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

        if not top_artists:
            return JsonResponse({
                "success" : True,
                "message" : "Please authorize again.",
                "data" : None
            })
    
        res = save_in_users_table(user_id, "top_artists", top_artists)

        return JsonResponse({
            "success": True,
            "message" : "Successfully fetched user top artists data and upadated supabase",
            "data" : top_artists
        })
        
    except Exception as e:
        print("Failed to fetch top artists :", str(e))
        return JsonResponse({
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@csrf_exempt    
def user_playlists(request):

    body = json.loads(request.body)

    # print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JsonResponse({
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_users_table(user_id, "playlists")
            if existing_data:
                return JsonResponse({
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
        if playlists : playlists.append({"tracks": saved_tracks, "name": "Liked Songs"})

        if not playlists:
            return JsonResponse({
                "success" : True,
                "message" : "Empty playlist data",
                "data" : None
            })

        res = save_in_users_table(user_id, "playlists", playlists)
        res2 = save_in_users_table(user_id, "saved_tracks", saved_tracks)

        return JsonResponse({
            "success": True,
            "message" : "Successfully fetched user playlists data",
            "data" : playlists
        })
    except Exception as e:
        print("Failed to fetch playlists :", str(e))
        return JsonResponse({
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@csrf_exempt    
def user_saved_tracks(request):

    body = json.loads(request.body)

    # print("RAW BODY IN USER :", body)

    token_info = body.get("token_info", None)

    if not token_info:
        print("Missing access token in header")
        return JsonResponse({
            "success" : False,
            "message" : "Missing access token in header",
            "data" : None
        })

    user_id = body.get("user_id", None)

    if user_id:
        try:
            existing_data = give_from_users_table(user_id, "saved_tracks")
            if existing_data :
                return JsonResponse({
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

        if not saved_tracks :
            return JsonResponse({
                "success" : True,
                "message" : "Empty saved_tracks data",
                "data" : None
            })

        res = save_in_users_table(user_id, "saved_tracks", saved_tracks)

        return JsonResponse({
            "success": True,
            "message" : "Successfully fetched saved tracks.",
            "data" : saved_tracks
        })
    except Exception as e:
        print("Failed to fetch the saved tracks :", str(e))
        return JsonResponse({
            "success": False,
            "message": "Error occured :"+str(e),
            "data": None
        })

@csrf_exempt
def send_review(request):
    try:
        body = json.loads(request.body)
        message = body.get("message")
        print("Received review message:", message)
        if not message:
            return JsonResponse({"success": False, "message": "Message is required"})

        if not is_clean_text(message):
            return JsonResponse({"success": False, "message": "Message contains invalid characters"})
        
        send_email(message)
        return JsonResponse({"success": True, "message": "Review submitted successfully"})

    except Exception as e:
        return JsonResponse({"success": False, "message": f"Failed to submit review: {str(e)}"})

@csrf_exempt
def create_playlist(request):
    
    body = json.loads(request.body)

    access_token = body.get("access_token", None)
    term = body.get("term", "long_term")
    name = body.get("name", None)
    description = body.get("description", None)

    if not access_token: 
        return JsonResponse({
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
        return JsonResponse({
            "success" : False,
            "message" : "Access token is invalid, please authorize again",
            "cause" : "token",
            "data" : None
        })
    
    try:
        top_tracks = give_from_users_table(user_id, "top_tracks")

        songs = [track.get("uri") for track in top_tracks.get(term)][:100]

        playlist_url = create_playlist_with_image(sp, user_id, songs, playlist_name=name, description=description)

        print("Playlist created : ", playlist_url)

        return JsonResponse({
            "success" : True,
            "message" : "New playlist created successfully",
            "data" : playlist_url
        })
    
    except Exception as e:
        print(f"Error occured in creating Playlist :{e}")
        return JsonResponse({
            "success" : False,
            "message" : f"Error occured in creating playlist {e}",
            "cause" : "server",
            "data" : None
        })
    

# Modifying the query from the database to return the data everytime till spotify allows for infinite users, after that it will only return data from database for only 5 days of inserting after that this will give None so that we can get new data from spotify
def give_from_users_table(user_id, column_name):
    try:
        # raw_updated_at = supabase.table("users").select("updated_at").eq("id", "31x5den2q6myr6azxpquyotn6bfa").single().execute()  

        # if raw_updated_at.data and raw_updated_at.data.get("updated_at"):
        #     updated_at = raw_updated_at.data["updated_at"]
        #     print(f"User {user_id} data last updated at:", updated_at)

        #     if updated_at and datetime.now() - datetime.fromisoformat(updated_at).replace(tzinfo=None) < timedelta(days=5): 
        result = supabase.table("users").select(column_name).eq("id", "31x5den2q6myr6azxpquyotn6bfa").single().execute()

        if result.data and result.data.get(column_name):
            print("Returning existing spotify data from the supabase")
            return result.data[column_name]

        return None

    except Exception as e:
        print("Error occured in checking in supabase function :", e)
        return None
    
def save_in_users_table(user_id, column_name, data):
    try:
        response = supabase.table("users").upsert({"id": user_id, column_name: data}).execute()
        print(f"Saved data in {column_name} in supabase")
        return True

    except Exception as e:
        print(f"Error occured in saving in supabase in {column_name}: {e}")
        return False
    
def give_from_recommendations_table(user_id, country, emotion):
    try:
        raw_updated_at = supabase.table("recommendations").select("updated_at").eq("user_id", user_id).eq("emotion", emotion).eq("country", country).single().execute()  

        if raw_updated_at.data and raw_updated_at.data.get("updated_at"):
            updated_at = raw_updated_at.data["updated_at"]
            print(f"User {user_id} data last updated at:", updated_at)

            if updated_at and datetime.now() - datetime.fromisoformat(updated_at).replace(tzinfo=None) < timedelta(days=5): 
                result = supabase.table("recommendations").select("recommendations").eq("id", user_id).eq("country", country).eq("emotion", emotion).single().execute()
                # print(f"Result from the supabase for {column_name} :", result)

                if result.data and result.data.get("recommendations"):
                    print("Returning existing recommendation data from the supabase")
                    return result.data["recommendations"]

        return None

    except Exception as e:
        print("Error occured in checking in supabase function :", e)
        return None

def save_in_recommendations_table(user_id, country, emotion, recommendations):
    try:

        update_response = supabase.table("recommendations").update({"recommendations" : recommendations}).eq("user_id", user_id).eq("country", country).eq("emotion", emotion).execute()

        if update_response.data:
            return True

        response = supabase.table("recommendations").insert({"recommendations" : recommendations, "country" : country, "emotion" : emotion, "user_id" : user_id}).execute()
        
        return True

    except Exception as e:
        print(f"Error occured in saving in recommendation table for {user_id} : {country} : {emotion} - {e}")
        return False