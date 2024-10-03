import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here

const Dashboard = () => {
  // State variables
  const [cafeInfo, setCafeInfo] = useState(null);
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

  // Effect to handle fetching token and cafe info
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const query = new URLSearchParams(hash);
    const accessTokenFromUrl = query.get('access_token');
    const refreshTokenFromUrl = query.get('refresh_token');
    const expiresIn = query.get('expires_in');

    if (accessTokenFromUrl && expiresIn) {
      const newExpiresAt = new Date(new Date().getTime() + parseInt(expiresIn, 10) * 1000);
      sendTokenToBackend(accessTokenFromUrl, refreshTokenFromUrl, newExpiresAt)
        .then(() => {
          fetchCafeAndTokenInfo();
        })
        .catch((error) => {
          setErrorMessage("Failed to store token data.");
          console.error('Error sending tokens to backend:', error);
        });

      window.location.hash = '';
    } else {
      setErrorMessage("Failed to retrieve tokens. Please try logging in again.");
      navigate('/login');
    }
  }, [navigate]);

  // Function to send tokens to backend
  const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/settoken', {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
      });
    } catch (error) {
      throw new Error('Error sending tokens to backend');
    }
  };

  // Function to fetch cafe and token info
  const fetchCafeAndTokenInfo = async () => {
    try {
      const response = await axios.get('https://cafequerator-backend.onrender.com/api/login');
      const { cafe_info, token_info } = response.data;

      const parsedCafeInfo = JSON.parse(cafe_info.replace(/'/g, '"'));
      setCafeInfo(parsedCafeInfo);

      const parsedTokenInfo = JSON.parse(token_info.replace(/'/g, '"'));
      setToken(parsedTokenInfo.access_token);
      setRefreshToken(parsedTokenInfo.refresh_token);
      setExpiresAt(parsedTokenInfo.expires_at);

      console.log('Cafe Info:', parsedCafeInfo);
      console.log('Token Info:', parsedTokenInfo);

    } catch (error) {
      setErrorMessage("Failed to fetch cafe and token information.");
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/logout');
      navigate('/');
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
