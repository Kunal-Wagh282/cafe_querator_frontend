import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import SpotifyLoginPage from './pages/SpotifyLoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Default route - Login Page */}
        <Route path="/register" element={<RegistrationPage />} /> {/* Registration Page */}
        <Route path="/spotify-login" element={<SpotifyLoginPage />} /> {/* Spotify Login Page */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Spotify Login Page */}

      </Routes>
    </Router>
  );
}

export default App;
