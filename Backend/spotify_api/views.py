from api.models import Spotify_Api_Parameters
from django.contrib.auth.models import User
from rest_framework.views import APIView,Response,status
from rest_framework import permissions
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.contrib import auth
import spotipy
import spotipy.util as util
from django.shortcuts import render, HttpResponseRedirect
from spotipy import oauth2
from .serializers import *


@method_decorator(csrf_protect, name='dispatch')
class SpotifyAuth(APIView):
    serializer_class = SpotifyAuthSerializer
    permission_classes = (permissions.AllowAny,)
    def post(self,request, format = None):

        data = request.data
        user = self.request.user
        username = user.username
        serializers = self.serializer_class(data=request.data)
        if serializers.is_valid():
        
            SPOTIFY_CLIENT_ID = serializers.validated_data['Client_Id']
            SPOTIFY_CLIENT_SECRET = serializers.validated_data['Client_Secret']
            scope = 'user-library-read'
            SPOTIFY_REDIRECT_URI= "http://localhost:8000/"

            sp_oauth = oauth2.SpotifyOAuth(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI,
                                    scope=scope,cache_path=".cache-" + username)
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                auth_url = sp_oauth.get_authorize_url()
                return HttpResponseRedirect(auth_url)
            
            access_token = token_info['access_token']
            refresh_token = token_info['refresh_token']
            expires_at = token_info['expires_at']

            sp_auth_par = Spotify_Api_Parameters(user=user, access_token=access_token,refresh_token=refresh_token,expires_at=expires_at)
            sp_auth_par.save() 

            return Response({ 'success': 'User authenticated On Spotify' })
    





