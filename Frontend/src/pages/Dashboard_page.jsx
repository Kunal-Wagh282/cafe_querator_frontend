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
    const query = new URLSearchParams(window.location.search);
    const authorizationCode = query.get('code');
    console.log("authorization_code :",authorizationCode)

    if (authorizationCode) {
      exchangeAuthorizationCode(authorizationCode)
        .then(({ accessToken, refreshToken, expiresAt }) => {
          sendTokenToBackend(accessToken, refreshToken, expiresAt)
            .then(() => {
              fetchCafeInfo(); // Fetch cafe info
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

      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setErrorMessage("Failed to retrieve authorization code. Please try logging in again.");
    }
  }, [navigate]);

  // Function to exchange authorization code for tokens
  const exchangeAuthorizationCode = async (code) => {
    const clientID = '44c18fde03114e6db92a1d4deafd6a43';
    const clientSecret = '645c1dfc9c7a4bf88f7245ea5d90b454';
    const redirectUri = 'http://localhost:5173/dashboard';

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

      console.log("access_token :",access_token);
      console.log("refresh_token",refresh_token);


      const expiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();

      console.log("expires_at",expiresAt);


      return { accessToken: access_token, refreshToken: refresh_token, expiresAt };
    } catch (error) {
      throw new Error('Error exchanging authorization code');
    }
  };

  // Function to send token data to the backend
  const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/settoken', {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      }, { withCredentials: true }); // Added withCredentials
    } catch (error) {
      throw new Error('Error sending token to backend');
    }
  };

  // Function to fetch cafe info
  const fetchCafeInfo = async () => {
    try {
      const response = await axios.get('https://cafequerator-backend.onrender.com/api/login', {
        withCredentials: true, // Added withCredentials
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
      await axios.post('https://cafequerator-backend.onrender.com/api/logout', {}, { withCredentials: true }); // Added withCredentials
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
