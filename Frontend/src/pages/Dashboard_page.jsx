import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here

const Dashboard = () => {
  // State variables
  const [cafeInfo, setCafeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Effect to handle fetching token and cafe info
  useEffect(() => {
    const query = new URLSearchParams(window.location.search); // Create a query object from the search parameters
    const authorizationCode = query.get('code'); // Extract authorization code from the query parameters

    // Check if authorization code is present
    if (authorizationCode) {
      // Exchange the authorization code for access and refresh tokens
      exchangeAuthorizationCode(authorizationCode)
        .then(({ accessToken, refreshToken, expiresAt }) => {
          // Send tokens to backend
          sendTokenToBackend(accessToken, refreshToken, expiresAt)
            .then(() => {
              fetchCafeAndTokenInfo(accessToken); // Fetch cafe info using the access token
            })
            .catch((error) => {
              setErrorMessage("Failed to store token data.");
              console.error('Error sending tokens to backend:', error);
            });
        })
        .catch((error) => {
          setErrorMessage("Failed to exchange authorization code for tokens.");
          console.error('Error exchanging authorization code:', error);
        });

      // Clear the query from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setErrorMessage("Failed to retrieve authorization code. Please try logging in again.");
      // Optionally navigate back to login
      // navigate('/');
    }
  }, [navigate]);

  // Function to exchange authorization code for tokens
  const exchangeAuthorizationCode = async (code) => {
    const clientID = '44c18fde03114e6db92a1d4deafd6a43'; // Your Spotify client ID
    const clientSecret = '645c1dfc9c7a4bf88f7245ea5d90b454'; // Your Spotify client secret
    const redirectUri = 'http://localhost:5173/dashboard'; // Your redirect URI

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientID,
          client_secret: clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration time
      const expiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();

      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
      console.log("Expires At:", expiresAt);
  

      return { accessToken: access_token, refreshToken: refresh_token, expiresAt };
    } catch (error) {
      throw new Error('Error exchanging authorization code');
    }
  };

  // Function to send tokens to backend
  const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
    try {
      console.log("Sending token to backend:", {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      });

      const response = await axios.post('https://cafequerator-backend.onrender.com/api/settoken', {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt, // Send expires_at to the backend
      });

      console.log("Token successfully sent:", response.data);
    } catch (error) {
      console.error('Error sending tokens to backend:', error.response ? error.response.data : error.message);
      throw new Error('Error sending tokens to backend');
    }
  };

  // Function to fetch cafe and token info
  const fetchCafeAndTokenInfo = async (accessToken) => {
    try {
      const response = await axios.get('https://cafequerator-backend.onrender.com/api/login', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include the access token in the request
        },
      });
      const { cafe_info } = response.data;

      const parsedCafeInfo = JSON.parse(cafe_info.replace(/'/g, '"'));
      setCafeInfo(parsedCafeInfo);
      
      console.log('Cafe Info:', parsedCafeInfo);

    } catch (error) {
      setErrorMessage("Failed to fetch cafe information.");
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/logout');
      navigate('/'); // Redirect to home or login page
    } catch (error) {
      setErrorMessage("Failed to log out. Please try again.");
    }
  };

  // Render the component
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to {cafeInfo ? cafeInfo.Cafe_Name : 'Cafe'}</h1>
        <p>Let's change the vibe today!</p>
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
          {cafeInfo ? (
            <div className="table-section">
              <h2>Cafe Details</h2>
              <p>Name: {cafeInfo.Cafe_Name}</p>
              <p>Address: {cafeInfo.Cafe_Address}</p>
              <p>Contact: {cafeInfo.Cafe_Contact}</p>
              <p>Owner: {cafeInfo.Owner_Name}</p>
              <p>No. of Tables: {cafeInfo.No_of_Tables}</p>
            </div>
          ) : (
            <p>Loading cafe information...</p>
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
