from django.urls import path
from . import views

urlpatterns = [
    path("api/connect-spotify", views.connect_spotify),
    path("callback", views.callback),
    path("api/user/", views.user_profile),
    path("api/top_tracks/", views.user_top_tracks),
    path("api/top_artists/", views.user_top_artists),
    path("api/playlists/", views.user_playlists),
    path("api/saved_tracks/", views.user_saved_tracks),
    path("api/review", views.send_review),
    path("api/create_playlist/", views.create_playlist),
]
