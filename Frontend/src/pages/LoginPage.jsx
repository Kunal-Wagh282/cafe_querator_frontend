import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API requests
import '../styles/LoginPage.css'; // Add your styles here
import cafeImage from '../images/LoginPage.png'; // Ensure this path is correct

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Make API request to login
      const response = await axios.post('https://cafequerator-backend.onrender.com/api/login', {
        email: username,
        password: password
      });

      // Check if response is successful and has the expected structure
      if (response.data && response.data.message === 'token set') {
        console.log('Login successful');

        // Store the received data for use in the dashboard
        const cafeData = JSON.parse(response.data.data.replace(/'/g, '"')); // Convert single quotes to double quotes for JSON parsing
        localStorage.setItem('cafeData', JSON.stringify(cafeData)); // Store cafe data in localStorage

        // Navigate to the dashboard page
        navigate('/Dashboard');
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please try again.');
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
            <button type="submit">Login</button>
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
