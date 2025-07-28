from django.urls import path

from . import views

urlpatterns = [
    path("api/connect-spotify/", views.connect_spotify, name="connect_spotify"),
    path("callback", views.callback, name="callback"),
    path("api/me/", views.user_spotify_data, name="user_spotify_data"),
    path("api/aianalysis/", views.ai_analysis, name="ai_analysis"),
    path("api/review", views.send_review, name="send_review"),
    path("api/check/", views.check, name="check"),
]