import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here
import CONFIG from '../config'; // Import the API URL


const Dashboard = () => {
  // State variables
  const [cafeInfo, setCafeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [searchResults, setSearchResults] = useState([]); // To store search results
  const [accessToken, setAccessToken] = useState(""); // For storing access token
  const [suggestions, setSuggestions] = useState([]); // To hold live suggestions
  const [features, setSongFeatures] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null); // For currently playing track
  const [isPlaying, setIsPlaying] = useState(false); // Playback status
  const [player, setPlayer] = useState(null); // State for the Spotify Player
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [uri, setUri] = useState('');
  const [playlistQuery, setPlaylistQuery] = useState(""); // For playlist search input
  const [playlistSuggestions, setPlaylistSuggestions] = useState([]); // To hold live playlist suggestions
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Selected playlist details
  const [selectedplaylistID, setSelectedPlaylistID] = useState(null) ;
  const clientID = '44c18fde03114e6db92a1d4deafd6a43';
  const clientSecret = '645c1dfc9c7a4bf88f7245ea5d90b454';
  const redirectUri = 'http://localhost:5173/dashboard';
  const [expiresAt, setExpiresAt] = useState('');
  const [refreshToken, setRefreshToken] = localStorage.getItem("refresh_token");


  const [jwt, setJwt] = useState(localStorage.getItem("jwt"));
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

  useEffect(() => {
    fetchCafeInfo();  
    
  }, [])
  
  useEffect(() => {
    if(uri !== ''){ 
    playSong(deviceId);
    }
    
  }, [uri])

    // Initialize Spotify Web Playback SDK
    // useEffect(() => {
    //   if (accessToken) {
    //     const script = document.createElement("script");
    //     script.src = "https://sdk.scdn.co/spotify-player.js";
    //     script.async = true;
    //     document.body.appendChild(script);
  
    //     window.onSpotifyWebPlaybackSDKReady = () => {
    //       const spotifyPlayer = new window.Spotify.Player({
    //         name: `Spotify Web Player of cafe ${cafeInfo.Cafe_Name}`,
    //         getOAuthToken: cb => { cb(accessToken); },
    //         volume: 1
    //       });
  
    //       spotifyPlayer.addListener('ready', ({ device_id }) => {
    //         console.log('Ready with Device ID', device_id);
    //         setDeviceId(device_id);
    //       });
  
    //       spotifyPlayer.addListener('player_state_changed', state => {
    //         if (state) {
    //           setTrackName(state.track_window.current_track.name);
    //           setArtistName(state.track_window.current_track.artists.map(artist => artist.name).join(', '));
    //           setIsPaused(state.paused);
    //         }
    //       });
    //       spotifyPlayer.connect();
    //       setPlayer(spotifyPlayer);
    //     };
    //   }
    // }, [accessToken]);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        if (isAccessTokenExpired(expiresAt)) {
          console.log("Access token is expired. Attempting to refresh...");
          refreshAccessToken(); // Call a function to refresh the token
        } else {
          console.log("Access token is still valid.");
        }
      }, 5000); // Check every 5 seconds
    
      return () => clearInterval(intervalId); // Cleanup on unmount
    }, [expiresAt]); // Dependency array ensures it runs whenever `expiresAt` changes


    const isAccessTokenExpired = (expiresAt) => {
      if (!expiresAt) {
        return true; // If expiresAt is not set, consider it expired
      }
      const now = new Date();
      
      return new Date(expiresAt) <= now; // Compare with current time
    };


    const refreshAccessToken = async () => {
      try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
          params: {
            grant_type: 'refresh_token',
            refresh_token: localStorage.getItem("refresh_token"), // Ensure refresh token is stored securely
            client_id: clientID,
            client_secret: clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const { access_token, expires_in } = response.data;
    setAccessToken(access_token);
    const newExpiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();
    setExpiresAt(newExpiresAt); // Update the expiration time
    console.log("Access token refreshed successfully.");

    sendTokenToBackend(access_token, refreshToken, newExpiresAt);     
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};

    const playSong = (deviceId) => {
      axios({
        method: 'put',
        url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          uris: [uri], // URI of the song to play
        },
      })
        .then(() => {
          console.log('Playing',trackName);
        })
        .catch((error) => {
          console.error('Error playing the song:', error);
        });
    };

    const handlePlayPause = () => {
      player.togglePlay();
    };

    

  // Function to exchange authorization code for tokens
  const exchangeAuthorizationCode = async (code) => {
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
      setAccessToken(access_token);
      setRefreshToken(refresh_token)
      localStorage.setItem("refresh_token",refresh_token)
      const expiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();
      return { accessToken: access_token, refreshToken: refresh_token, expiresAt };
    } catch (error) {
      throw new Error('Error exchanging authorization code');
    }
  };

  // Function to send token data to the backend
  const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
    try {
      console.log("To Backend")
      await axios.post(`${CONFIG.API_URL}/settoken`, 
        {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      }, 
      {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json', // Specify content type
      }
    }
    ); // Added withCredentials
    } catch (error) {
      throw new Error('Error sending token to backend');
    }
  };

  // Function to fetch cafe info
  const fetchCafeInfo = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/login`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      console.log(response.data)
      const { cafe_info ,token_info } = response.data;
      setAccessToken(token_info.access_token);
      setCafeInfo(cafe_info);
      setExpiresAt(token_info.expires_at);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${CONFIG.API_URL}/logout`, {}); // Added withCredentials
      localStorage.removeItem("jwt");
      if(player)
      {
        setDeviceId(null);
        setAccessToken("");
        setIsPlaying(false);
        setCurrentTrack(null);
        player.disconnect();
      }
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
    setUri(response.data.uri);

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
          console.log(features)

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
  

  // --------------------------------------------------------------------------------------------------------------------------------
  const handlePlaylistSearchSubmit = async (e) => {
    e.preventDefault();
    if (playlistQuery) {
      const results = await searchPlaylists(playlistQuery);
      if (results.length > 0) {
        setSelectedPlaylist(results[0]);

      }
    }
  };
  
  const handlePlaylistInputChange = (e) => {
    const value = e.target.value;
    setPlaylistQuery(value);
    fetchPlaylistSuggestions(value); // Fetch playlist suggestions based on input
  };
  
  const handlePlaylistSuggestionClick = async (playlist) => {
    setPlaylistQuery(playlist.name);
    setSelectedPlaylist(playlist);
    setSelectedPlaylistID(playlist.id)
    setPlaylistSuggestions([]);
    console.log("name : ",playlist.name,"id : ",playlist.id)

    const playlistData = {
      playlist_name: playlist.name,
      playlist_id: playlist.id,
     };

     try {
      // Call the POST API
      const response = await axios.post('https://cafequerator-backend.onrender.com/api/setplaylistvector', playlistData,

        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json', // Specify content type
          }
        }
      );
      console.log('Playlist data sent successfully:', response.data);
          } catch (error) {
              console.error('Error sending playlist data to backend:', error);
          }

          console.log("name:", playlist.name, "id:", playlist.id);
  
  };
  
  // function to search playlist 
  const searchPlaylists = async (query) => {
    if (!accessToken) return [];
  
    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`;
  
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.playlists.items;
    } catch (error) {
      console.error('Error searching for playlists:', error);
      return [];
    }
  };


  const fetchPlaylistSuggestions = async (query) => {
    if (!query) {
      setPlaylistSuggestions([]);
      return;
    }
  
    const results = await searchPlaylists(query);
    setPlaylistSuggestions(results);
  };
  
  // --------------------------------------------------------------------------------------------------------------------------------
  // fetching hte features of the playlists 
  
  
  


  // Render the component
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome {cafeInfo ? cafeInfo.Cafe_Name : 'Cafe'} to Cafe-Qurator</h1>
        <p><br /><br  /><br/>Let's change the vibe today!</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h1>Dashboard</h1>
          <button className="sidebar-btn" >Home</button>
          <button className="sidebar-btn">Admin</button>

          <form onSubmit={handlePlaylistSearchSubmit}>
            <input  
            type = "text"
            placeholder = "search your playlist"
            value = {playlistQuery}
            onChange = {handlePlaylistInputChange}
            />
          </form>

            <button type = "submit">Search Playlist</button>
            
            {playlistSuggestions.length > 0 && (
                <div className="playlist-suggestions">
                  <ul>
                    {playlistSuggestions.map((playlist) => (
                      <li key={playlist.id} onClick={() => handlePlaylistSuggestionClick(playlist)}>
                        {playlist.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
        </div>

        <div className="main-section">
          <div>
            <h1>Table</h1>
          </div>
        {/* <img src={DashboardPage} alt="Cafe Illustration" /> */}

          {/* Removed the error message and cafe information section */}
        </div>

        <div className="queuee-section">
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
              <button type="submit">Play</button>
            </form> 
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
          <h3>Now Playing: {trackName} by {artistName}</h3>
            <button onClick={handlePlayPause}>{isPaused ? 'Play' : 'Pause'}</button>

            {/* {accessToken ? <WebPlayback token={accessToken} /> : <p>Loading Spotify Web Playback...</p>} */}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
