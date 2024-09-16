import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = "44c18fde03114e6db92a1d4deafd6a43"; // Your Spotify client ID

const SpotifyLoginPage = () => {
  const REDIRECT_URI = "http://localhost:5173/dashboard"; // Ensure this matches your Spotify dashboard
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const BACKEND_API = "https://cafequerator-backend.onrender.com/api/settoken"; 
  const [token, setToken] = useState("");
  const navigate = useNavigate(); // useNavigate hook for redirection

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
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
      window.localStorage.setItem("token", accessToken);

      // Set the token and send it to the backend
      setToken(accessToken);
      sendTokenToBackend(accessToken);

      // Redirect to the dashboard page
      navigate('/dashboard'); // This ensures redirection happens after login
    } else if (storedToken) {
      // If token exists in localStorage, set it to state
      setToken(storedToken);
    }
  }, [navigate]);

  // Function to send token to backend
  const sendTokenToBackend = async (accessToken) => {
    try {
      await axios.post(BACKEND_API, { 
        access_token: accessToken,
        refresh_token: "your_refresh_token", // Replace if necessary
        expires_at: new Date(new Date().getTime() + 3600 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Error sending tokens to backend:', error);
    }
  };

  // Logout functionality
  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
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
