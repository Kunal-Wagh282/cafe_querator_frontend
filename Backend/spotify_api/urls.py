from .views import *
from django.urls import path

urlpatterns = [
    path('spotify-auth',SpotifyAuth.as_view())
]