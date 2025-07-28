
from spotipy import Spotify, SpotifyException
from spotipy.oauth2 import SpotifyOAuth
from utils import fetch_user_details
from decouple import config

CLIENT_ID = config("SF_CLIENT_ID")
CLIENT_SECRET = config("SF_CLIENT_SECRET")
REDIRECT_URI = config("REDIRECT_URI")
SCOPE = "user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-recently-played user-read-email user-read-private"

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE
    )

token1 = "BQBKjrPC9Xz9EZ0LDudA6RduCW5-dPKVFPa2FxlbIsLSwqLuZhrXcTq9963KDc76TdKcItEXY1iYq-WXD8wrXm-c3-hGOiYl0wWGl3TAV6hFut-NllNHerW_6D8mVmOSyKfIEV5GZ2gdtyHUyrrf_CzqijKw3lO8sXj_sirF7m_i_EpIZKAPQYJN-xJrgTiRbH4ndyqWdZeH47LH135VrbLCz52SitSSULSHRZYO5uFhcMzNQYBjFHrfeO9vXMeyrMvfAmIfthIxr_Z4SAvndQF5uJXpxw"
token2 = "BQCrb4gVZ2IF1br3pvVp0J83ebq-axLYvVb2SheRZIt1lyvA2dKu9y8qQ4gA0F1_6hopFlbX6RsKOzWqOe-z4BwTnMF5EUV2r62Doa5vfWIxrX3QxF71QrHcGdqazxZmNfY52l28MJE6cbMpBvImyoNmcVsb-xsV_tEqvKRrUaevQL5dzFfHLaU2HBGaR0ymkPY6rI2jtNEMpvpyaLHqSGX88f58Om4bwom3Ys2d0lf4xTqsJm29scraTJ6O6_9GftqI2wuf7OMavYY-WhRUax_YFhG8Hw"

rt1 = "AQBn2EO-ScAvqGgiKVSz30Ndr7d_w0F0iHo8mLNiE0I-_nQ6vzNatHnrZLr5u4IBbhyivGpukzhz1GIB6E_DH87K47W-hRpdYM0lfL4Z5XDm56jD6yXyYEPsOQCnUQFs0Cs"
rt2 = "AQBn2EO-ScAvqGgiKVSz30Ndr7d_w0F0iHo8mLNiE0I-_nQ6vzNatHnrZLr5u4IBbhyivGpukzhz1GIB6E_DH87K47W-hRpdYM0lfL4Z5XDm56jD6yXyYEPsOQCnUQFs0Cs"

at1 = get_spotify_oauth().refresh_access_token(rt1)
at2 = get_spotify_oauth().refresh_access_token(rt2)

sp1 = Spotify(auth=token1).get("access_token", None)
sp2 = Spotify(auth=token2).get("access_token", None)

data1 = fetch_user_details(sp1)

print("DATA 1 : ", data1)

data2 = fetch_user_details(sp2)

print("DATA 2: ", data2)