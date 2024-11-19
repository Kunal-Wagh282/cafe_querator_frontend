import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here
import CONFIG from '../config'; // Import the API URL
import Preloader from '../components/Prealoader';

const Dashboard = () => {
  // State variables
  // Authentication and Tokens
  const [accessToken, setAccessToken] = useState("");
  const [expiresAt, setExpiresAt] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"));

  // Player and Track Info
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [player, setPlayer] = useState(null);
  //const [deviceId, setDeviceId] = useState(null);
  const [uri, setUri] = useState('');
  const [trackId, setTrackid] = useState(""); // For search input
  const [songName, setSongname] = useState(""); // For search input
  const [track_artist_name, setTrack_Artist_Name] = useState(""); // For search input
  const [track_img_url, setTrack_Image_Url] = useState(""); // For search input


  // table number const
  const [totalTables, setTotalTables ]= useState("") ; // You can change this value dynamically if needed
  const [rows, setRows ]= useState([]) ; // You can change this value dynamically if needed
  const [tableColors, setTableColors] = useState({});


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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);// starting song when login is done !!

  // Cafe/Feature Info
  const [cafeInfo, setCafeInfo] = useState(null);

  // Routing and Navigation
  const navigate = useNavigate();
  const clientID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  //Socket
  const [socket, setSocket] = useState(null);


  // Miscellaneous
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate data loading or some async operation
    }, 3000); // The preloader will display for 3 seconds
  }, []);

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    fetchCafeInfo();
  }, []);
  
  useEffect(() => {
    if(totalTables){
    const rows= generateTableRows(totalTables)// Get rows of tables
    setRows(rows);
    }
  }, [totalTables]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const jwt = localStorage.getItem('jwt'); // Retrieve JWT token from localStorage
      // console.log('JWT Token:', jwt);

      if (!jwt) {
        console.error('JWT token not found!');
        return; // Handle this case accordingly (e.g., redirect to login)
      }

      const ws = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${jwt}`);

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        //const data = JSON.parse(event.data);
        console.log(event.data)
        if (event.data === 'queue updated') {
          
          fetchQueue();
  
        }
        if (event.data === 'current track updated') {
          //fetchQueue();
        }
      };

      ws.onclose = (event) => {
        console.warn('WebSocket connection closed:', event);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('Retrying connection...');
        setTimeout(() => {
          const newWs = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${jwt}`);
          setSocket(newWs);
        }, 5000); // Retry after 5 seconds
      };

      setSocket(ws);

      // Cleanup on component unmount
      return () => {
        ws.close();
      };
    }, 3000); // Delay of 5 seconds

    // Cleanup the timeout if the component unmounts before the timeout completes
    return () => clearTimeout(timeoutId);
  }, []);


  



  const playNextSong = async () => {
    try {
      // Fetch the next track from the API
      const response = await axios.get(`${CONFIG.QUEUE_URL}/next-track`, {
        headers: {
          "Authorization": `Bearer ${jwt}`, // Pass the access token if required
          "Content-Type": "application/json"
        },
      });
  
      if (response.status === 200 && response.data.Next_track) 
      {
        const data = response.data.Next_track;
        console.log(data.track_id);
  
        // Update the state with the next track details
        setSongname(data.track_name);
        setTrackid(data.track_id);
        setTrack_Artist_Name(data.track_artist_name);
        setTrack_Image_Url(data.track_img_url);
  
         
        // Play the next track
        playSong(data.track_id); // Call your existing playSong function

        // If needed, send a POST request to notify the backend that the track has been played
        
          try {
            const postResponse = await axios.post(`${CONFIG.QUEUE_URL}/next-track`, {}, {
              headers: {
                "Authorization": `Bearer ${jwt}`, // Pass the access token if required
                "Content-Type": "application/json"
              },
            });
            console.log("Next Track Post Called");
            setIsButtonDisabled(true);
          } catch (error) {
            console.error("Error removing track from queue:", error);
          }
        
        // Fetch the queue to ensure it’s up to date
        await fetchQueue();
        
      } 
      else {
        console.log("No next track available.");
      }
    } catch (error) {
      console.error("Error fetching the next track:", error);
      alert("No Songs in the Queue!")
    }
  };
  
  // Player event listener
  useEffect(() => {
    if (accessToken) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
  
      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: `Spotify Web Player of cafe ${cafeInfo?.Cafe_Name || "Unknown Cafe"}`,
          getOAuthToken: cb => { cb(accessToken); },
          volume: 1
        });
  
        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          //setDeviceId(device_id);
          localStorage.setItem("device_id",device_id)
        });
  
        spotifyPlayer.addListener('player_state_changed', state => {
          if (state) {
              setTrackName(state.track_window.current_track.name);
              setArtistName(
                  state.track_window.current_track.artists.map(artist => artist.name).join(', ')
              );
              setIsPaused(state.paused);
      
              const endTimeoutDelay = state.duration - state.position - 5000; // Pause before 5 seconds of song ends
              const waitDelay = 5 * 1000; // Wait 5 seconds before skipping
              const resumeTimeoutDelay = endTimeoutDelay + waitDelay;
      
              // Clear existing timeouts if they exist
              if (window.spotifyTimeout1) {
                  clearTimeout(window.spotifyTimeout1);
              }
              if (window.spotifyTimeout2) {
                  clearTimeout(window.spotifyTimeout2);
              }
      
              // Set a timeout to pause the song 5 seconds before it ends
              window.spotifyTimeout1 = setTimeout(() => {
                  console.log('Song Ended');
                  window.spotify_player && window.spotify_player.pause();
                  console.log('Waiting 5 Seconds...');
                  // Call playNextSong after the song has ended and 5 seconds have passed
                  playNextSong();
              }, endTimeoutDelay);
      
              // Set a timeout to skip the song after waiting 5 seconds
              window.spotifyTimeout2 = setTimeout(() => {
                  console.log('Resuming Song...');
                  window.spotify_player && window.spotify_player.nextTrack();
              }, resumeTimeoutDelay);
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
      const spotifyRefreshToken = response.data.refresh_token || refreshToken;
      if(response.data.refresh_token)
      {
        localStorage.setItem("refresh_token",response.data.refresh_token)
      }
      console.log("Access token refreshed successfully.");
      sendTokenToBackend(access_token, spotifyRefreshToken, newExpiresAt);     
      } 
    catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };

  

  const handlePlayPause = () => {
    player.togglePlay();
  };

  // Function to send token data to the backend
  const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
    try {
      if(refreshToken){
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
    console.log("Token Sent to Backend")
    }
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
      localStorage.setItem("refresh_token",token_info.refresh_token);
      setAccessToken(token_info.access_token);
      setCafeInfo(cafe_info);
      setRefreshToken(token_info.refresh_token);
      setExpiresAt(token_info.expires_at);
      setTotalTables(cafe_info.No_of_Tables)
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
        //setDeviceId(null);
        localStorage.removeItem("device_id");
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
      return response.data.tracks.items; // Return search results
    } catch (error) {
      console.error('Error searching for songs:', error);
      return []; // Return an empty array on error
    }
  };

// Function to fetch song features by track ID
const playSong = async (track_id) => {
  if (!accessToken) return null;

  const endpoint = `https://api.spotify.com/v1/audio-features/${track_id}`;
  try {
    // Fetch song audio features
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const songUri = response.data.uri; // Get the song URI from the response
    const deviceId=localStorage.getItem("device_id");
    // Play the song using the URI
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        uris: [songUri], // URI of the song to play
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Playing song with URI:', songUri);

  } catch (error) {
    console.error('Error fetching song features or playing the song:', error);
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
        

        // Fetch the song features
        //const features = await fetchSongFeatures(trackId);
        //playSong(selectedTrack.id);
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
  
   
  // get qr function 
  const getQRcode = async () => {
    try {
      const response = await axios.post(
        'https://cafequerator-backend.onrender.com/api/genpdf', 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${jwt}` , // Replace with your JWT token
          },
          responseType: 'blob', // Important for handling binary data
        }
      );
  
      // Create a Blob from the PDF Stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
  
      // Create a link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'generated_qr_codes.pdf'; // Name of the file
      link.click(); // Trigger download
  
      // Clean up
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading the PDF:',error);
    }
  
  };

// --------------------------------------------------------main section code for the table functionality------------------------------------------------------------
        // Function to generate table rows dynamically
        const generateTableRows = (numberOfTables) => {
          const tables = Array.from({ length: numberOfTables }, (_, index) => index + 1);
          const rows = [];

          // Split the tables into rows of 7
          for (let i = 0; i < tables.length; i += 7) {
            rows.push(tables.slice(i, i + 7)); // Create a row with up to 7 tables
          }

          return rows;
        };


        // function to give clickable event of the table

        // const handleTableClick = async (table) => {
        //   console.log(`Table ${table} clicked!`);
          
          // API call
          const handleTableClick = async (table) => {
            console.log(`Table ${table} clicked!`);
        
            // Toggle table color
            setTableColors((prevColors) => ({
              ...prevColors,
              [table]: prevColors[table] === 'green' ? 'red' : 'green',
            }));
        
            // API call logic (optional)
            try {
              const response = await axios.post(
                `${CONFIG.QUEUE_URL}/remove-table`,
                {
                  table_no: table,
                },
                {
                  headers: {
                    Authorization: `Bearer ${jwt}`, // Replace with actual JWT
                  },
                }
              );
              console.log('API response:', response.data);
            } catch (error) {
              console.error('Error during API call:', error);
            }
          };
          
        


  // Render the component
  return (
    
    <div className="dashboard-container">
        {loading ? (
        <Preloader /> // Show the preloader
      ) : (<></>)}
      <header className="dashboard-header">
        <h1>Welcome {cafeInfo ? cafeInfo.Cafe_Name : 'Cafe'} to Cafe-Qurator</h1>
        <p><br /><br  /><br/>Let's change the vibe today!</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h1>Dashboard</h1>
          <button className="sidebar-btn" >Home</button>
          <button
            className="sidebar-btn"
            onClick={playNextSong}
            disabled={isButtonDisabled}
            style={{
              backgroundColor: isButtonDisabled ? '#d3d3d3' : '#007bff', // Change color when disabled
              color: isButtonDisabled ? '#a1a1a1' : '#fff', // Text color when disabled
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer', // Change cursor when disabled
            }}>
            Start Vibe
          </button>
          <button className="sidebar-btn" onClick={getQRcode} >Table QR</button>

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
      
       {/* --------------------------this is the main sectio code----------------------------- */}
          <div className="main-section">
            <div className="table-heading">
              <h1>Table</h1>
            </div>
            <div className="table-status">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="table-row">
                  {row.map((table) => (
                    <div
                      key={table}
                      className="table-square"
                      onClick={() => handleTableClick(table)}
                      role="button"
                      tabIndex={0}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: tableColors[table] || 'red', // Default to red
                        width: '50px',
                        height: '50px',
                        display: 'inline-block',
                        margin: '5px',
                        textAlign: 'center',
                        lineHeight: '50px',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {table}
                    </div>
                  ))}
                </div>
              ))}
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
              <button type="submit">Add to Queue</button>
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
      </div>


      {/* Current Song Section */}
        <div className="current-song-section">
          <h3>Now Playing</h3>
          <div className="current-song-info">
            {/* Display the album art dynamically */}
            <img src={track_img_url || 'https://placeholder.com/150'} alt="Album Art" />
            <div className="current-song-details">
              {/* Display the current song name dynamically */}
              <p className="song-title">{songName || 'Song Title'}</p>
              {/* Display the artist name dynamically */}
              <p className="artist-name">{track_artist_name || 'Artist Name'}</p>
              <button onClick={handlePlayPause}>{isPaused ? 'Play' : 'Pause'}</button>
              <button onClick={playNextSong}>Next Song PLay</button>

              
            </div>
            
          </div>
        </div>
    </div>

  );
};

export default Dashboard;
