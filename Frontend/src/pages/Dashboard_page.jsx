import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here

const Dashboard = () => {
  // State variables
  const [cafeInfo, setCafeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [searchResults, setSearchResults] = useState([]); // To store search results
  const [accessToken, setAccessToken] = useState(""); // For storing access token
  const [suggestions, setSuggestions] = useState([]); // To hold live suggestions
  const [features, setSongFeatures] = useState([]);


  const navigate = useNavigate();

  // Effect to handle fetching token and cafe info
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const authorizationCode = query.get('code');

    if (authorizationCode) {
      exchangeAuthorizationCode(authorizationCode)
        .then(({ accessToken, refreshToken, expiresAt }) => {
          setAccessToken(accessToken); // Set access token
          return sendTokenToBackend(accessToken, refreshToken, expiresAt);
        })
        .then(() => {
          fetchCafeInfo(); // Fetch cafe info
        })
        .catch((error) => {
          console.error('Error during authorization:', error);
        });

      window.history.replaceState({}, document.title, window.location.pathname);
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

      const expiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();

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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post('https://cafequerator-backend.onrender.com/api/logout', {}, { withCredentials: true }); // Added withCredentials
      navigate('/'); // Redirect to home or login page
    } catch (error) {
      console.error("Failed to log out. Please try again.");
    }
  };

  // Function to search songs using Spotify API
  const searchSongs = async (query) => {
    if (!accessToken) return [];

    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

    try {
      console.log("access_token",accessToken)
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

// Function to fetch song features by track ID
const fetchSongFeatures = async (trackId) => {
  if (!accessToken) return null;

  const endpoint = `https://api.spotify.com/v1/audio-features/${trackId}`;

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Features",response.data)
    return response.data; // Return song features
  } catch (error) {
    console.error('Error fetching song features:', error);
    return null; // Return null on error
  }
};

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery) {
      const results = await searchSongs(searchQuery);
  
      if (results.length > 0) {
        const selectedTrack = results[0]; // Assuming the first result is what the user meant
        const trackId = selectedTrack.id;
        
        // Fetch the song features
        const features = await fetchSongFeatures(trackId);
        
        if (features) {
          // Store the features (e.g., danceability, energy, etc.)
          setSongFeatures(features); // Assume you have a state to store features
        }
      }
    }
  };
  

  // Function to fetch song suggestions
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const results = await searchSongs(query); // Await results
    setSuggestions(results); // Store search results as suggestions
  };



  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value); // Fetch suggestions based on input
  };


  const handleSuggestionClick = (track) => {
    // Set the input value to the selected track's name
    setSearchQuery(track.name);
  
    // Clear the suggestions dropdown
    setSuggestions([]);
  
    // Optionally, clear the search results if you are displaying them somewhere else
    setSearchResults([]);
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
          {/* Removed the error message and cafe information section */}
        </div>

        <div className="queue-section">
          <h2>Queue</h2>
          <div className="spotify-queue">
            <p>Spotify queue will display here</p>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit">Search</button>
            </form>

            {/* Display search results
            {searchResults.length > 0 && (
              <div className="search-results">
                <h2>Search Results</h2>
                <ul>
                  {searchResults.map((track) => (
                    <li key={track.id}>
                      {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}

            {/* Display suggestions */}
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
