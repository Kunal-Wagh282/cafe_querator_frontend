from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class CafeInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user', 'Cafe_Name', 'Cafe_Address', 'Cafe_Contact', 'Owner_Name', 'Owner_Contact']

class SpotifyCredSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user', 'Client_Id', 'Client_Secret']

class SpotifyApiSerializer(serializers.ModelSerializer):
    class Maeta:
        model = User
        fields = ['user', 'access_token', 'refresh_token', 'expires_at']