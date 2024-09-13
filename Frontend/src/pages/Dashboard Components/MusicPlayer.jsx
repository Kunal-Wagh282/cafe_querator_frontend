// MusicPlayer.jsx
import React from "react";
import "./styles/Dashboard_Styles/MusicPlayer.css";

const MusicPlayer = () => {
  return (
    <div className="music-player">
      <span>Hotel California - Eagles</span>
      <div className="controls">
        <button>⏮</button>
        <button>⏯</button>
        <button>⏭</button>
      </div>
      <div className="time-info">
        <span>3:23</span>
        <input type="range" min="0" max="100" />
        <span>6:24</span>
      </div>
    </div>
  );
};

export default MusicPlayer;
