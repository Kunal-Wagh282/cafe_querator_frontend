import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import SpotifyLoginPage from './pages/SpotifyLoginPage';
import Dashboard from './pages/Dashboard_page';
import './App.css';
import Table from './pages/Table';
import Landing from './pages/Landing';
import Outh from './pages/Outh';
function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Landing />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} /> {/* Registration Page */}
        <Route path="/spotify-login" element={<SpotifyLoginPage />} /> {/* Spotify Login Page */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/:cafename/table/:tableid" element={<Table/>} /> {/* http://localhost:5173/B/table/9?id=36 */}
        <Route path="/outh" element={<Outh/>} /> 



      </Routes>
    </Router>
  );
}

export default App;
