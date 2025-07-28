from django.shortcuts import redirect, render
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.static import serve as static_serve
from spotipy import Spotify, SpotifyException
from spotipy.oauth2 import SpotifyOAuth
from decouple import config
import json
from urllib.parse import urlencode
from .utils import supabase, fetch_all_saved_tracks, fetch_all_top_tracks, fetch_all_top_artists, fetch_all_playlists, fetch_user_details, send_email, check_limit, is_clean_text, debugPrint, refresh_token_if_expired, get_spotify_oauth
from .base import createStory
from datetime import datetime, timedelta

TOKEN_SESSION_KEY = "spotify_token_info"

ENV = config("ENV", default="DEV")
FRONTEND_URL = config("FRONTEND_URL", default="/")

callback_redirect = f"{FRONTEND_URL}/spotify-callback" if ENV == "DEV" else "/spotify-callback"

debugPrint("CALLBACK REDIRECT :"+callback_redirect)

def printSession(request):
    print("Session:")
    for key, value in request.session.items():
        print(f"  {key}: {value}")

def connect_spotify(request):
    session = request.session
    for key, value in session.items():
        print(f"  {key}: {value}")
    token_info = session.pop(TOKEN_SESSION_KEY, None)

    if token_info:
        token_info = refresh_token_if_expired(token_info)
        session[TOKEN_SESSION_KEY] = token_info.get("access_token")
        return redirect(callback_redirect)

    auth_url = get_spotify_oauth().get_authorize_url()
    session[TOKEN_SESSION_KEY] = None
    return redirect(auth_url)


def callback(request):
    code = request.GET.get("code")
    if not code:
        return redirect("/")

    token_info = get_spotify_oauth().get_access_token(code, as_dict=True)
    request.session[TOKEN_SESSION_KEY] = token_info
    printSession(request)
    return redirect(callback_redirect)



def user_spotify_data(request):
    printSession(request)   
    token_info = request.session.get(TOKEN_SESSION_KEY)

    if not token_info:
        return JsonResponse({"success": False, "message": "Unauthorized", "data": None}, status=401)

    token_info = refresh_token_if_expired(token_info)
    sp = Spotify(auth=token_info["access_token"])

    try:
        user_profile = sp.current_user()
        user_id = user_profile["id"]
    except SpotifyException as e:
        return JsonResponse({"success": False, "message": str(e), "data": None}, status=401)

    try:
        raw_updated_at = supabase.table("users").select("updated_at").eq("id", user_id).single().execute()
        updated_at = raw_updated_at.data.get("updated_at") if raw_updated_at.data else None

        if updated_at and datetime.now() - datetime.fromisoformat(updated_at).replace(tzinfo=None) < timedelta(days=10):
            result = supabase.table("users").select("data").eq("id", user_id).single().execute()
            if result.data and result.data.get("data"):
                return JsonResponse({"success": True, "message": "User data from Supabase", "data": result.data["data"]})

    except Exception: pass

    try:
        data = {
            "user": fetch_user_details(sp),
            "saved_tracks": fetch_all_saved_tracks(sp),
            "top_tracks": fetch_all_top_tracks(sp),
            "top_artists": fetch_all_top_artists(sp),
            "playlists": fetch_all_playlists(sp),
        }

        if data["saved_tracks"]:
            data["playlists"].append({"name": "Liked Songs", "tracks": data["saved_tracks"]})

        try:
            supabase.table("users").upsert({"id": user_id, "data": data}).execute()
        except Exception: pass

        return JsonResponse({"success": True, "message": "Fresh data from Spotify", "data": data})

    except SpotifyException as e:
        return JsonResponse({"success": False, "message": str(e), "data": None}, status=500)



@csrf_exempt
def ai_analysis(request):
    printSession(request)
    body = json.loads(request.body)
    data = body.get("data", {})
    user_id = data.get("user", {}).get("id")

    if not user_id:
        return JsonResponse({"success": False, "message": "User ID required", "data": None}, status=400)

    try:
        raw_updated_at = supabase.table("users").select("updated_at").eq("id", user_id).single().execute()
        updated_at = raw_updated_at.data.get("updated_at")

        if updated_at and datetime.now() - datetime.fromisoformat(updated_at).replace(tzinfo=None) < timedelta(days=100):
            response = supabase.table("users").select("ai_analysis").eq("id", user_id).single().execute()
            if response.data and response.data.get("ai_analysis"):
                return JsonResponse({"success": True, "message": "Existing AI analysis", "data": response.data["ai_analysis"]})
    except Exception: pass

    try:
        if not check_limit(request, "ai_analysis"):
            return JsonResponse({"success": False, "message": "Rate limit exceeded", "data": None}, status=429)

        story = createStory(data)
        if not story:
            return JsonResponse({"success": False, "message": "Failed to generate AI analysis", "data": None}, status=500)

        try:
            supabase.table("users").update({"ai_analysis": story}).eq("id", user_id).execute()
        except Exception: pass

        return JsonResponse({"success": True, "message": "AI analysis generated", "data": story})

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e), "data": None}, status=500)


@csrf_exempt
def send_review(request):
    body = json.loads(request.body)
    message = body.get("message", "")

    if not message:
        return JsonResponse({"success": False, "message": "Message required"}, status=400)

    if not is_clean_text(message):
        return JsonResponse({"success": False, "message": "Invalid characters"}, status=400)

    try:
        send_email(message)
        return JsonResponse({"success": True, "message": "Review submitted"})
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

def check(request):
    return JsonResponse({"Django Running" : True})


if ENV == "PROD":
    def spa_catch_all(request, path=None):
        if path.startswith("/api/"):
            return JsonResponse({"detail": "API route not found"}, status=404)
        return FileResponse(open("static/index.html", "rb"))
