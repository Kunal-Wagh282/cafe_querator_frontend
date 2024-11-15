import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Table.css'; // Ensure CSS for styling
import API_URL from '../config'; // Import the API URL

const Table = () => {
  const { cafename, tableid } = useParams(); // Extracts :cafename and :tableid from URL  
  const [cjwt, setCJwt] = useState('');
  const [accessToken, setAccessToken] = useState(""); // For storing access token
  const location = useLocation(); // To access query parameters
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [suggestions, setSuggestions] = useState([]); // To hold live suggestions
  const [searchResults, setSearchResults] = useState([]); // To store search results
  const [songName, setSongname] = useState(""); // For search input
  const [trackId, setTrackid] = useState(""); // For search input

  // Use URLSearchParams to parse the query string
  const searchParams = new URLSearchParams(location.search);
  const cafeid = searchParams.get('id'); // Extract `code` query param


  useEffect(() => {
    // Fetch JWT token once the component mounts
    setJwtToken()
    .then(() => {
      fetchToken()}) // Call the token fetch function
  }, [tableid]); // Re-run if cafeId changes


  
        

  const fetchToken = async () => {
    try {
      
      const response = await axios.get(`${API_URL}/access-token`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cjwt')}`,
        },
      });
      if(response.status === 200){
      setAccessToken(response.data.access_token);
      console.log("Access Token Set!")
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const setJwtToken = async () => {
    try {
      const response = await axios.post('https://cafequerator-backend.onrender.com/customer/api/login', {
        cafeId: cafeid, // Correct way to send query parameters in GET request
        tableNum:tableid
      });

      if (response.status === 200) {
        console.log(response.data);
        localStorage.setItem('cjwt', response.data.cjwt); // Store JWT in localStorage
        setCJwt(response.data.cjwt); // Store the JWT in state
      }
    } catch (error) {
      console.error('Error fetching JWT:', error);
    }
  };

  const addTrack = async () => {
    try {
      console.log(songName,trackId,localStorage.getItem('cjwt'))
      const response = await axios.post('https://cafequerator-backend.onrender.com/managequeue/add-track',
        {
        track_name: songName,
        track_id: trackId
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cjwt')}`,
          'Content-Type': 'application/json',
        }
      });

      if(response.status === 200){

      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };



  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery) {
      const results = await searchSongs(searchQuery);
  
      if (results.length > 0) {
        const selectedTrack = results[0]; // Assuming the first result is what the user meant
        const trackId = selectedTrack.id;
        setSongname(selectedTrack.name);
        setTrackid(selectedTrack.id);

        // Fetch the song features
        const features = await fetchSongFeatures(trackId);
        if (features) {
          // Store the features (e.g., danceability, energy, etc.)
         // setSongFeatures(features); // Assume you have a state to store features
          console.log(features)
        }
      }
    }
  };

  const handleSuggestionClick = (track) => {
    // Set the input value to the selected track's name
    setSearchQuery(track.name);
  
    // Clear the suggestions dropdown
    setSuggestions([]);
  
    // Optionally, clear the search results if you are displaying them somewhere else
    setSearchResults([]);

  };

  const fetchSongFeatures = async (trackId) => {
    if (!accessToken) return null;
  
    const endpoint = `https://api.spotify.com/v1/audio-features/${trackId}`;
  
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // setUri(response.data.uri);
  
      return response.data; // Return song features
    } catch (error) {
      console.error('Error fetching song features:', error);
      return null; // Return null on error
    }
  };
  


    // Handle search input change
    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      fetchSuggestions(value); // Fetch suggestions based on input
    };
  

    const fetchSuggestions = async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
  
      const results = await searchSongs(query); // Await results
      setSuggestions(results); // Store search results as suggestions
    };

    const searchSongs = async (query) => {
      if (!accessToken) return [];
  
      const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
  
      try {
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('Search Response:', response.data); // Log the response data
        return response.data.tracks.items; // Return search results
      } catch (error) {
        console.error('Error searching for songs:', error);
        return []; // Return an empty array on error
      }
    };


  return (
    <div className="table-container">
      {/* Search Bar */}
      <div className="search-bar">
      <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit">Search</button>
            </form> 
      </div>
      <button className="sidebar-btn" onClick={addTrack}>Add to Queue</button>
      {suggestions.length > 0 && (
          <div className="suggestions">
            <ul>
              {suggestions.map((track) => (
                <li key={track.id} onClick={() => handleSuggestionClick(track)}>
                  {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
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
