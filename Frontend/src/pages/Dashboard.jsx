// Dashboard.jsx
import React from "react";
import Sidebar from "./Dashboard Components/Sidebar";
import TableStatus from "./Dashboard Components/Table_status";
import SpotifyQueue from "./Dashboard Components/Spotify_Queue";
import MusicPlayer from "./Dashboard Components/MusicPlayer";
import "./styles/Dashboard.css";  // For styling

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>Good Evening, Admin.</h1>
          <p>Let’s change the vibe today!</p>
        </header>
        <TableStatus />
        <SpotifyQueue /> {/* You can implement this part yourself */}
      </div>
      <MusicPlayer />
    </div>
  );
};

export default Dashboard;
