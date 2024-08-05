from rest_framework import serializers
from api.models import *

class SpotifyAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spotify_Cred
        fields = ['Client_Id', 'Client_Secret']

