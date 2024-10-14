import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Table.css'; // Ensure CSS for styling

const Table = () => {
  const { cafename, tableid } = useParams(); // Extracts :cafename and :tableid from URL
  const location = useLocation(); // Access the query parameters
  const searchParams = new URLSearchParams(location.search); // Create a URLSearchParams object from the location search
  const cafeId = searchParams.get('id'); // Extracts 'id' from the query string
  const [cjwt, setCJwt] = useState('');

  useEffect(() => {
    // Fetch JWT token once the component mounts
    setJwtToken(); // Call the token fetch function
  }, [cafeId]); // Re-run if cafeId changes
        

  const fetchToken = async () => {
    try {
      const response = await axios.get('https://cafequerator-backend.onrender.com/customer/api/getaccess', {
        headers: {
          'Authorization': `Bearer ${cjwt}`,
        },
      });
  
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const setJwtToken = async () => {
    try {
      const response = await axios.get('https://cafequerator-backend.onrender.com/customer/api/login', {
        cafeId: cafeId , // Correct way to send query parameters in GET request
      });

      if (response.status === 200) {
        console.log(response.data);
        localStorage.setItem('cjwt', response.data.jwt); // Store JWT in localStorage
        setCJwt(response.data.jwt); // Store the JWT in state
      }
    } catch (error) {
      console.error('Error fetching JWT:', error);
    }
  };

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
