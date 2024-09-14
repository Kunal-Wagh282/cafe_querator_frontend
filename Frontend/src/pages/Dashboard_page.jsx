import React from 'react';
import '../styles/Dashboard.css'; // Add your styles here

const Dashboard = () => {
  // Retrieve the cafe data from localStorage
  const cafeData = JSON.parse(localStorage.getItem('cafeData'));
  
  // Extract the cafe name
  const cafeName = cafeData ? cafeData.Cafe_Name : 'Cafe';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to {cafeName}</h1>
        
        <p>Let's change the vibe today!</p>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h1>Dashboard</h1>
          <button className="sidebar-btn">Home</button>
          <button className="sidebar-btn">Admin</button>
          {/* Add more sidebar buttons or links as needed */}
        </div>

        <div className="main-section">
          <div className="table-section">
            <h2>Table</h2>
            {/* Add content for tables or other features here */}
          </div>
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
