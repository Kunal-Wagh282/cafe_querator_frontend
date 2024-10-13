import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import cafeImage from '../images/LoginPage.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postResponse = await axios.post('https://cafequerator-backend.onrender.com/api/login', {
        email: username,
        password: password
      });

      if (postResponse.data && postResponse.data.message === 'token set') {
        
        localStorage.setItem("jwt", postResponse.data.jwt);
        // Navigate to Spotify login
        navigate('/dashboard');
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
