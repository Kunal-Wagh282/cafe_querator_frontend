import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = "44c18fde03114e6db92a1d4deafd6a43"; // Your Spotify client ID

const SpotifyLoginPage = () => {
  const REDIRECT_URI = "http://localhost:5173/dashboard"; // Ensure this matches your Spotify dashboard
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "code"; // You can keep this as "token" if you want to use implicit grant
  const [token, setToken] = useState("");
  const navigate = useNavigate(); // useNavigate hook for redirection

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      // Extract the access token from the URL hash
      const accessToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      // Log the extracted access token
      console.log('Extracted Access Token:', accessToken);

      // Clear the URL hash to prevent displaying the token in the URL
      window.location.hash = "";

      // Set the token
      setToken(accessToken);

      // Redirect to the dashboard page
      navigate('/dashboard'); // This ensures redirection happens after login
    }
  }, [navigate]);

  // Logout functionality
  const logout = () => {
    setToken("");
  };

  return (
    <div>
      <h1>Spotify Login</h1>
      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
        >
          Login to Spotify
        </a>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
};

export default SpotifyLoginPage;
