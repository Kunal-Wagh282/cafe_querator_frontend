import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here
import CONFIG from '../config'; // Import the API URL
import Preloader from '../components/Prealoader';

const Outh = () => {
// State variables
  // Authentication and Tokens
  const [accessToken, setAccessToken] = useState("");
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
  const navigate = useNavigate();




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
  const [errorMessage, setErrorMessage] = useState("");
  const [features, setSongFeatures] = useState([]);

  const clientID = '44c18fde03114e6db92a1d4deafd6a43';
  const clientSecret = '645c1dfc9c7a4bf88f7245ea5d90b454';
  const redirectUri = 'http://localhost:5173/outh';
    


  const [loading, setLoading] = useState(true);

  
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const authorizationCode = query.get('code');
        
        if (authorizationCode) {
          exchangeAuthorizationCode(authorizationCode)
            .then(({ accessToken, refreshToken, expiresAt }) => {
              //setAccessToken(accessToken); // Set access token
              console.log(accessToken, refreshToken, expiresAt)
              return sendTokenToBackend(accessToken, refreshToken, expiresAt);
            })
            .then(() => {
              //fetchCafeInfo(); // Fetch cafe info
              navigate('/dashboard')
            })
            .catch((error) => {
              console.error('Error during authorization:', error);
            });
    
          window.history.replaceState({}, document.title, window.location.pathname);
         
        }
      }, []);


      const sendTokenToBackend = async (accessToken, refreshToken, expiresAt) => {
        try {
          await axios.post(`${CONFIG.API_URL}/settoken`, 
            {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
          }, 
          {
          headers: {
            'Authorization': `Bearer ${jwt}`,
          }
        }
        ); // Added withCredentials
        } catch (error) {
            console.log(error)
          throw new Error('Error sending token to backend');
        }
      };
    


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
          //setAccessToken(access_token);
          //setRefreshToken(refresh_token)
          localStorage.setItem("refresh_token",refresh_token)
          const expiresAt = new Date(new Date().getTime() + parseInt(expires_in, 10) * 1000).toISOString();
          return { accessToken: access_token, refreshToken: refresh_token, expiresAt };
        } catch (error) {
          throw new Error('Error exchanging authorization code');
        }
      };

  return (
    <div>
<Preloader /> 
    </div>
  )
}

export default Outh