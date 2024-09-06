from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


class Cafe_Info(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Cafe_Name = models.CharField(max_length=255,default='')
    Cafe_Address = models.CharField(max_length=500,default='')
    Cafe_Contact = models.CharField(max_length=15,default='')
    Owner_Name = models.CharField(max_length=255,default='')
    Owner_Contact = models.CharField(max_length=15,default='')
    No_of_Tables = models.IntegerField(default=1)
    
class Spotify_Api_Parameters(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=500)
    refresh_token = models.CharField(max_length=500)
    expires_at = models.IntegerField()

class Vibe_Check_Parameters(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Playlist_Vector = models.IntegerField()

class Track_Queue(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Table_Number = models.IntegerField(default=-1)
    Track_Name = models.CharField(max_length=255)
    Track_Id = models.CharField(max_length=255)

class Tables_Queue(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Table_Number = models.IntegerField()
    Table_Status = models.BooleanField(default=False)
