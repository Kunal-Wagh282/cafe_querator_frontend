import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Table.css'; // Ensure CSS for styling
import CONFIG from '../config'; // Import the API URL
import Navbar from '../components/Navbar'; // Import the Navbar component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import Toastify CSS
import Preloader from '../components/Prealoader';


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
  const [queue, setQueue] = useState([]);
  // Use URLSearchParams to parse the query string
  const searchParams = new URLSearchParams(location.search);
  const cafeid = searchParams.get('id'); // Extract `code` query param
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  
    useEffect(() => {
      setTimeout(() => {
        setLoading(false); // Simulate data loading or some async operation
      }, 3000); // The preloader will display for 3 seconds
    }, []);

  useEffect(() => {
    // Fetch JWT token once the component mounts
    setJwtToken()
    .then(() => {
      fetchToken()}) // Call the token fetch function
  }, [tableid]); // Re-run if cafeId changes

  useEffect(() => {
    fetchQueue();
  }, []);
  


  

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cjwt = localStorage.getItem('cjwt'); // Retrieve JWT token from localStorage
      // console.log('JWT Token:', jwt);

      if (!cjwt) {
        console.error('JWT token not found!');
        return; // Handle this case accordingly (e.g., redirect to login)
      }

      const ws = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${cjwt}`);

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
          updateCurrentSong();
          console.log("Change song")
        }
        
      };

      ws.onclose = (event) => {
        console.warn('WebSocket connection closed:', event);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('Retrying connection...');
        setTimeout(() => {
          const newWs = new WebSocket(`wss://cafequerator-backend.onrender.com/ws/queue/?jwt=${cjwt}`);
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

  const updateCurrentSong = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/current-track`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cjwt')}`,
        },
      });
      console.log(response)
      if(response.status === 200){
      
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

    
  const fetchToken = async () => {
    try {
      const response = await axios.get(`${CONFIG.CUSTOMER_URL}/access-token`, {
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
      const response = await axios.post(`${CONFIG.CUSTOMER_URL}/login`, {
        cafeId: cafeid, // Correct way to send query parameters in GET request
        tableNum:tableid
      });

      if (response.status === 200) {
        localStorage.setItem('cjwt', response.data.cjwt); // Store JWT in localStorage
        setCJwt(response.data.cjwt); // Store the JWT in state
      }
    } catch (error) {
      console.error('Error fetching JWT:', error);
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
        return response.data.tracks.items; // Return search results
      } catch (error) {
        console.error('Error searching for songs:', error);
        notify("info","Please Select a song!!");
        return []; // Return an empty array on error
      }
    };


    const fetchQueue = async () => {
      try {
        const response = await axios.get(`${CONFIG.QUEUE_URL}/get-queue`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('cjwt')}`,
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



    const addTrack = async () => {
      try {
        const results = await searchSongs(searchQuery);
        if (results.length > 0) {
          const selectedTrack = results[0];
          setSongname(selectedTrack.name);
          setTrackid(selectedTrack.id);
          const response = await axios.post(`${CONFIG.QUEUE_URL}/add-track`,
            {
              track_name: selectedTrack.name,
              track_id: selectedTrack.id,
              track_artist_name: selectedTrack.artists[0]?.name || 'Unknown Artist',
              track_img_url: selectedTrack.album?.images[0]?.url || 'https://placeholder.com/150',
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('cjwt')}`,
                'Content-Type': 'application/json',
              },
            }
          );
          //console.log(response)
          if (response.status === 200) {
            fetchQueue(); // Refresh queue
            setSearchQuery('');
            notify("success","Your Song Is Added!!");
          }
          if (response.status === 226) {
            notify("info","Song Already in Queue!!");
          }
        }
      } catch (error) {
        if(error.response.data.error === "unauthorized"){
          notify("error","Unauthorized, Scan QR again!!")
          return
        }
        if(error.response.data.message === "Vibe not match"){
          console.log(error)
          notify("error","Vibe does not match, try another song!!")
          return
        }
        else{
        console.error('Error adding song:', error);
        }
      }
    };
    
    const notify = (type, message) => {
      const config = {
        position: "top-center", // Positioning the toast
        autoClose: 5000,        // Auto-close after 5 seconds
        hideProgressBar: false, // Show progress bar
        closeOnClick: true,     // Close on click
        pauseOnHover: true,     // Pause when hovered
        draggable: true,        // Allow dragging
        progress: undefined,    // No custom progress bar
      };
    
      switch (type) {
        case "success":
          toast.success(message, config);
          break;
        case "error":
          toast.error(message, config);
          break;
        case "info":
          toast.info(message, config);
          break;
        case "warning":
          toast.warning(message, config);
          break;
        default:
          toast(message, config); // Default toast type
          break;
      }
    };
    


  return (
    <div className="table-container">
      {loading ? (
        <Preloader /> // Show the preloader
      ) : (<></>)}
    <Navbar cafeName={cafename}/>
      {/* Search Bar */}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a song..."
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <button className="sidebar-btn" onClick={addTrack}>
          Add Song to Queue
        </button>
        <ToastContainer />
      </div>
      
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
)}


{/* Queue Section */}
<div className="queue">
  <h2 className="queue-header">Ongoing Queue</h2>
  <ul className="queue-list">
    {queue.length > 0 ? (
      queue.filter(track => track.id !== -1) // Filter out tracks with id -1
      .map((track, index) => (
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
      </div>
      </div>
  </div>
</div>

  );
};

export default Table;
