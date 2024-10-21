import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import SpotifyLoginPage from './pages/SpotifyLoginPage';
import Dashboard from './pages/Dashboard_page';
import './App.css';
import Table from './pages/Table';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Landing />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} /> {/* Registration Page */}
        <Route path="/spotify-login" element={<SpotifyLoginPage />} /> {/* Spotify Login Page */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/:cafename/table/:tableid" element={<Table/>} /> 

      </Routes>
    </Router>
  );
}

export default App;
