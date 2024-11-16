import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here
import CONFIG from '../config'; // Import the API URL


const Dashboard = () => {
  // State variables
  // Authentication and Tokens
  const [accessToken, setAccessToken] = useState("");
  const [expiresAt, setExpiresAt] = useState('');
  const [refreshToken, setRefreshToken] = localStorage.getItem("refresh_token");
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"));

  // Player and Track Info
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [uri, setUri] = useState('');
  const [trackId, setTrackid] = useState(""); // For search input
  const [songName, setSongname] = useState(""); // For search input


  // Search and Suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [playlistQuery, setPlaylistQuery] = useState("");
  const [playlistSuggestions, setPlaylistSuggestions] = useState([]);

  // Playlist Management
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedplaylistID, setSelectedPlaylistID] = useState(null);
  const [queue, setQueue] = useState([]);

  // Cafe/Feature Info
  const [cafeInfo, setCafeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [features, setSongFeatures] = useState([]);

  // Routing and Navigation
  const navigate = useNavigate();

  // Miscellaneous
  const clientID = '44c18fde03114e6db92a1d4deafd6a43';
  const clientSecret = '645c1dfc9c7a4bf88f7245ea5d90b454';
  const redirectUri = 'http://localhost:5173/dashboard';

  useEffect(() => {
    fetchQueue();
    fetchCafeInfo();
  }, []);
  
  useEffect(() => {
    if(uri !== ''){ 
    playSong(deviceId);
    }
  }, [uri])

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

    // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (accessToken) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: `Spotify Web Player of cafe ${cafeInfo.Cafe_Name}`,
          getOAuthToken: cb => { cb(accessToken); },
          volume: 1
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('player_state_changed', state => {
          if (state) {
            setTrackName(state.track_window.current_track.name);
            setArtistName(state.track_window.current_track.artists.map(artist => artist.name).join(', '));
            setIsPaused(state.paused);
          }
        });
        spotifyPlayer.connect();
        setPlayer(spotifyPlayer);
      };
    }
  }, [accessToken]);

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


  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${CONFIG.QUEUE_URL}/get-queue`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      if (response.status === 200) {
        setQueue(response.data.Queue); // Assuming the backend response contains a 'queue' array
        console.log('Queue fetched:', response.data);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };


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
      } 
    catch (error) {
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
      localStorage.removeItem("refresh_token");
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
        setSongname(selectedTrack.name);
        setTrackid(selectedTrack.id);
        // Fetch the song features
        const features = await fetchSongFeatures(trackId);
        try {
          const response = await axios.post(
            `${CONFIG.QUEUE_URL}/add-track`,
            {
              track_name: selectedTrack.name,
              track_id: selectedTrack.id,
              track_artist_name: selectedTrack.artists[0]?.name || 'Unknown Artist',
              track_img_url: selectedTrack.album?.images[0]?.url || 'https://placeholder.com/150',
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (response.status === 200) {
            fetchQueue(); // Refresh queue
            setSearchQuery('');
          }
        } catch (error) {
          console.error('Error adding song:', error);

        }
        // if (features) {
        //   // Store the features (e.g., danceability, energy, etc.)
        //   setSongFeatures(features); // Assume you have a state to store features
        // }
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
          <h1>Ongoing Queue</h1>
        </div>
        
        {/* Queue Section */}
          <div className="queue">
            <ul className="queue-list">
              {queue.length > 0 ? (
                queue.map((track, index) => (
                  <li key={index} className="queue-item">
                    {/* Display song image dynamically */}
                    <img 
                      src={track.track_img_url || 'https://placeholder.com/150'} // Use dynamic image URL
                      alt={track.track_name}
                      className="track-image"
                    />
                    <div className="track-info">
                      {/* Display song name dynamically */}
                      <span className="track-name">{track.track_name}</span>
                      {/* Display artist name dynamically */}
                      <span className="artist-name">{track.track_artist_name}</span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="no-songs">No songs in the queue</p>
              )}
            </ul>
          </div>
        </div>

        <div className="queue-section">
          <h2>Queue</h2>
          <div className="spotify-queue">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit">Add & Play</button>
            </form> 

            {suggestions.length > 0 && (
              <div className="suggestions">
                <ul>
                  {suggestions.map((track) => (
                    <li key={track.id} onClick={() => handleSuggestionClick(track)} className="suggestion-item">
                      <img 
                        src={track.album?.images[0]?.url || 'https://placeholder.com/150'} // Display album image
                        alt={track.name}
                        className="suggestion-image"
                      />
                      <div className="suggestion-text">
                        <span className="track-name">{track.name}</span>
                        <span className="artist-name">{track.artists.map((artist) => artist.name).join(', ')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              )
            }
          </div>
        </div>
      </div>

      {/* <div className="music-player">
          <div className="player-bar">
          <h3>Now Playing: {trackName} by {artistName}</h3>
            <button onClick={handlePlayPause}>{isPaused ? 'Play' : 'Pause'}</button>

            { {accessToken ? <WebPlayback token={accessToken} /> : <p>Loading Spotify Web Playback...</p>} }
          </div>
        </div> */
      }

      {/* Current Song Section */}
        <div className="current-song-section">
          <h3>Now Playing</h3>
          <div className="current-song-info">
            {/* Display the album art dynamically */}
            <img src={queue[0]?.track_img_url || 'https://placeholder.com/150'} alt="Album Art" />
            <div className="current-song-details">
              {/* Display the current song name dynamically */}
              <p className="song-title">{queue[0]?.track_name || 'Song Title'}</p>
              {/* Display the artist name dynamically */}
              <p className="artist-name">{queue[0]?.track_artist_name || 'Artist Name'}</p>
              <button onClick={handlePlayPause}>{isPaused ? 'Play' : 'Pause'}</button>
            </div>
            
          </div>
        </div>


    </div>

  );
};

export default Dashboard;
