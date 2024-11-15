import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import cafeImage from '../images/LoginPage.png';
import CONFIG from '../config'; // Import the API URL

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const navigate = useNavigate();
  const [jwt, setJwt] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST request to login and set the token, no need for Authorization header here
      const postResponse = await axios.post(`${CONFIG.API_URL}/login`, {
        email: username,
        password: password
      });


      if (postResponse.data && postResponse.data.message === 'token set') {
        console.log('Login successful');
        localStorage.setItem('jwt', postResponse.data.jwt);  // Store the new token
        setJwt(postResponse.data.jwt);

        const accesstokenIsValid = await accessTokenIsSet(postResponse.data.jwt); // Await token check
        if (accesstokenIsValid) {
          navigate('/dashboard');
        } else {
          navigate('/spotify-login');
        }
          
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accessTokenIsSet = async (jwt) => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/login`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      const { token_info } = response.data;
      if (token_info && token_info !== "Not set") { 
        setExpiresAt(token_info.expires_at);
        return !isAccessTokenExpired(token_info.expires_at);
      } else {
        console.log("Token not set")
        return false;
      }      
    } catch (error) {
      console.error('Error fetching token info:', error);
      return false;
    }
  };

  // Function to check if the access token has expired
  const isAccessTokenExpired = (expiresAt) => {
    if (!expiresAt) {
      return true; // If expiresAt is not set, consider it expired
    }
    const now = new Date();
    if (new Date(expiresAt) < now) {
      console.log("Access Token is Expired");
    } else {
      console.log("Access Token is Valid!");
    }
    return new Date(expiresAt) < now; // Compare with current time
  };

  return (
    <div className="login-page">
      <h1>Welcome to cafe-Qurator</h1>
      <div className="login-content">
        <div className="login-image">
          <img src={cafeImage} alt="Cafe Illustration" />
        </div>
        <div className="login-form">
          <h2>Login Account</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p>
            Don't have an account? <Link to="/register">Register here !!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
