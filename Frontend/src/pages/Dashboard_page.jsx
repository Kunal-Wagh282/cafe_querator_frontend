import React from 'react';
import '../styles/Dashboard.css'; // Style your dashboard here

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Good Evening, Admin.</h1>
        <p>Let's change the vibe today!</p>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
            <h1>Dashboard</h1>
          <button className="sidebar-btn">Home</button>
          <button className="sidebar-btn">Admin</button>
        </div>

        <div className="main-section">
          <div className="table-section">
            <h2>Table</h2>
            {/* Add tables for status here */}
          </div>

          <div className="queue-section">
            <h2>Queue</h2>
            {/* Blank container for Spotify Queue */}
            <div className="spotify-queue">
              <p>Spotify queue will display here</p>
            </div>
          </div>
        </div>

        <div className="music-player">
          {/* Blank container for Spotify Music Player */}
          <div className="player-bar">
            <p>Spotify player controls will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;