import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file for styling
import cafeImage from './images/LoginPage.png'; // Import your image

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'user' && password === 'password') {
      console.log('Login successful');
      navigate('/Dashboard'); // Navigate to the dashboard after login
    } else {
      alert('Invalid username or password');
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
