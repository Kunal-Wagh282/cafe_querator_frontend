import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Add your styles here
import CONFIG from '../config'; // Import the API URL
import Preloader from '../components/Prealoader';

const Outh = () => {
// State variables
  const [jwt, setJwt] = useState(localStorage.getItem("jwt"));
  const navigate = useNavigate();

  const clientID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;  
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const authorizationCode = query.get('code');
        
        if (authorizationCode) {
          exchangeAuthorizationCode(authorizationCode)
            .then(({ accessToken, refreshToken, expiresAt }) => {
              //setAccessToken(accessToken); // Set access token
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
        console.log("Token Sent to Backend")
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