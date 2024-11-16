import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // Your Spotify client ID

const SpotifyLoginPage = () => {
  const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI; // Redirect URI after Spotify login
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "code"; // Using authorization code flow
  const SCOPE = "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state"; // Add necessary scopes
  const navigate = useNavigate();

  // This effect can be removed since we're not handling any tokens here
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    if (code) {
      navigate('/outh');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Spotify Login</h1>
      <a
        href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
      >
        Login to Spotify
      </a>
    </div>
  );
};

export default SpotifyLoginPage;
