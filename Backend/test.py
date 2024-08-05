import spotipy
from spotipy.oauth2 import SpotifyOAuth

scope = "user-library-read"

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope,client_id='"618aacd3fc0a44809cbbf26681e33410',client_secret='3cada71173e14492a8f6786d5156dc35',redirect_uri='http://127.0.0.1:8000/spotify/redirect'))

results = sp.current_user_saved_tracks()
for idx, item in enumerate(results['items']):
    track = item['track']
    print(idx, track['artists'][0]['name'], " – ", track['name'])