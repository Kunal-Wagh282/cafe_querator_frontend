import React from 'react';
import '../styles/Table.css'; // Make sure to create a CSS file for styling

const Table = () => {
  return (
    <div className="table-container">
      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search" />
      </div>

      {/* Queue Section */}
      <div className="queue-section">
        <h3>Queue :</h3>
        <ul className="queue-list">
          <li>
            <div className="song-info">
              <img src="path/to/album-art.jpg" alt="Album Art" />
              <div>
                <p className="song-title">Feel Good</p>
                <p className="artist-name">The Zaraz</p>
              </div>
            </div>
          </li>
          <li>
            <div className="song-info">
              <img src="path/to/album-art.jpg" alt="Album Art" />
              <div>
                <p className="song-title">Picture (feat. Sheryl Crow)</p>
                <p className="artist-name">Kid Rock, Sheryl Crow</p>
              </div>
            </div>
          </li>
          {/* Add more songs as needed */}
        </ul>
      </div>

      {/* Current Song Section */}
      <div className="current-song-section">
        <h3>Current song :</h3>
        <div className="current-song-info">
          <img src="path/to/album-art.jpg" alt="Album Art" />
          <div className="current-song-details">
            <p className="song-title">Tera Ban Jaunga</p>
            <p className="artist-name">Darshan Raval</p>
          </div>
        </div>
        <div className="music-controls">
          <button className="control-button">⏮</button>
          <button className="control-button">⏯</button>
          <button className="control-button">⏭</button>
        </div>
      </div>
    </div>
  );
};

export default Table;
