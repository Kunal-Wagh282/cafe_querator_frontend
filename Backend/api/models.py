from django.db import models
from django.contrib.auth.models import User


class Cafe_Info(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Cafe_Name = models.CharField(max_length=255,default='')
    Cafe_Address = models.CharField(max_length=500,default='')
    Cafe_Contact = models.CharField(max_length=15,default='')
    Owner_Name = models.CharField(max_length=255,default='')
    Owner_Contact = models.CharField(max_length=15,default='')
    
    
class Spotify_Cred(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Client_Id = models.CharField(max_length=500,default='')
    Client_Secret = models.CharField(max_length=500,default='')

class Spotify_Api_Parameters(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=500)
    refresh_token = models.CharField(max_length=500)
    expires_at = models.IntegerField()
