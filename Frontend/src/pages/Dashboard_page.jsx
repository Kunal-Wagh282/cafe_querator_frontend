import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here

const CLIENT_ID = "44c18fde03114e6db92a1d4deafd6a43"; // Your Spotify client ID

const Dashboard = () => {
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract access token and other parameters from URL hash
    const hash = location.hash.substring(1);
    const query = new URLSearchParams(hash);
    const accessTokenFromUrl = query.get('access_token');
    const refreshTokenFromUrl = query.get('refresh_token');
    const expiresIn = query.get('expires_in');

    if (accessTokenFromUrl && expiresIn) {
      // Calculate expiration time
      const newExpiresAt = new Date(new Date().getTime() + parseInt(expiresIn, 10) * 1000);

      // Store tokens in local storage
      window.localStorage.setItem("token", accessTokenFromUrl);
      window.localStorage.setItem("expires_at", newExpiresAt.toISOString());

      // Update state
      setToken(accessTokenFromUrl);
      setExpiresAt(newExpiresAt);
      setIsValidToken(true);

      // Clear the URL hash
      window.location.hash = '';
    } else {
      // If no token, handle accordingly
      const storedToken = window.localStorage.getItem("token");
      const storedExpiresAt = window.localStorage.getItem("expires_at");

      if (storedToken && storedExpiresAt) {
        setToken(storedToken);
        setExpiresAt(new Date(storedExpiresAt));
        checkTokenValidity(storedToken, storedExpiresAt);
      } else {
        // Redirect to login if no token details are found
        navigate('/login');
      }
    }
  }, [location, navigate]);

  const checkTokenValidity = async (accessToken, expiresAt) => {
    const now = new Date();
    if (now > new Date(expiresAt)) {
      await refreshAccessToken();
    } else {
      setIsValidToken(true);
    }
  };

  const refreshAccessToken = async (retryCount = 0) => {
    const maxRetries = 3;

    try {
      const response = await axios.post("https://accounts.spotify.com/api/token", 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }), {
          headers: {
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:your_client_secret`)}`
          }
        }
      );

      const { access_token, expires_in } = response.data;
      const newExpiresAt = new Date(new Date().getTime() + expires_in * 1000);

      // Update localStorage with new tokens
      window.localStorage.setItem("token", access_token);
      window.localStorage.setItem("expires_at", newExpiresAt.toISOString());

      setToken(access_token);
      setExpiresAt(newExpiresAt);
      setIsValidToken(true);
      setErrorMessage("");
    } catch (error) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await refreshAccessToken(retryCount + 1);
      } else {
        setErrorMessage("Failed to refresh access token after multiple attempts. Please log in again.");
      }
    }
  };

  const fetchSpotifyData = async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Spotify user data:', response.data);
    } catch (error) {
      setErrorMessage("Failed to fetch Spotify data. Please try again.");
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/logout');
      // Clear local storage after logout
      window.localStorage.clear();
      // Redirect to login page
      navigate('/');
    } catch (error) {
      setErrorMessage("Failed to log out. Please try again.");
    }
  };

  // Retrieve the cafe data from localStorage
  const cafeData = JSON.parse(localStorage.getItem('cafeData'));
  const cafeName = cafeData ? cafeData.Cafe_Name : 'Cafe';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to {cafeName}</h1>
        <p>Let's change the vibe today!</p>
        {/* Add Logout button in the header */}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h1>Dashboard</h1>
          <button className="sidebar-btn">Home</button>
          <button className="sidebar-btn">Admin</button>
        </div>

        <div className="main-section">
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {isValidToken ? (
            <>
              <div className="table-section">
                <h2>Table</h2>
                {/* Add content for tables or other features here */}
              </div>
              <button onClick={fetchSpotifyData}>Fetch Spotify Data</button>
            </>
          ) : (
            <p>Access token is invalid or expired. Please log in again.</p>
          )}
        </div>

        <div className="queue-section">
          <h2>Queue</h2>
          <div className="spotify-queue">
            <p>Spotify queue will display here</p>
          </div>
        </div>
      </div>

      <div className="music-player">
        <div className="player-bar">
          <p>Spotify player controls will go here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
