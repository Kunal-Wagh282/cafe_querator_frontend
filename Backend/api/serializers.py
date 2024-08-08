from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','password']

class CafeInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe_Info
        fields = ['Cafe_Name', 'Cafe_Address', 'Cafe_Contact', 'Owner_Name', 'Owner_Contact']

class SpotifyCredSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spotify_Cred
        fields = ['Client_Id', 'Client_Secret']

class SpotifyApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spotify_Api_Parameters
        fields = ['user', 'access_token', 'refresh_token', 'expires_at']