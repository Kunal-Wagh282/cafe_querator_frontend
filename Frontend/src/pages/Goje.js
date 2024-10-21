import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CLIENT_ID = '44c18fde03114e6db92a1d4deafd6a43'; // Your Spotify client ID
const REDIRECT_URI = 'http://localhost:5173/callback'; // Redirect URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'streaming'
];
const YELLOW_TRACK_URI = 'spotify:track:3AJwUDP919kvQ9QcozQPxg'; // Spotify URI for "Yellow" by Coldplay

function App() {
  const [token, setToken] = useState('');
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find(elem => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (token) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: "Spotify Web Player",
          getOAuthToken: cb => { cb(token); },
          volume: 1
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          // Play Yellow by Coldplay when the player is ready
          playSong(device_id);
        });

        spotifyPlayer.addListener('player_state_changed', state => {
          if (state) {
            setTrackName(state.track_window.current_track.name);
            setArtistName(state.track_window.current_track.artists.map(artist => artist.name).join(', '));
            setIsPaused(state.paused);
          }
        });

        spotifyPlayer.connect();
        setPlayer(spotifyPlayer);
      };
    }
  }, [token]);

  const playSong = (deviceId) => {
    axios({
      method: 'put',
      url: https://api.spotify.com/v1/me/player/play?device_id=${deviceId},
      headers: {
        'Authorization': Bearer ${token},
        'Content-Type': 'application/json',
      },
      data: {
        uris: [YELLOW_TRACK_URI], // URI of the song to play
      },
    })
    .then(() => {
      console.log('Playing "Yellow" by Coldplay');
    })
    .catch(error => {
      console.error('Error playing the song:', error);
    });
  };

  const handlePlayPause = () => {
    player.togglePlay();
  };

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <div className="App">
      {!token ? (
        <a
        href={${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}}
      >
        Login to Spotify
      </a>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <h3>Now Playing: {trackName} by {artistName}</h3>
            <button onClick={handlePlayPause}>{isPaused ? 'Play' : 'Pause'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;