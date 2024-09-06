import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useEffect } from 'react';
import axios from 'axios'; // Ensure axios is imported
import RegistrationForm from './RegistrationForm';
import './App.css';
import API_URL from './config'; // Import the API URL

function App() {
  // Optional: Define setError if it's used for setting state or logging errors
  const setError = (message) => {
    console.error(message);
    // Implement error handling logic if needed
  };

  useEffect(() => {
    // Function to call the API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/csrf_cookie`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          console.log('CSRF cookie fetched successfully',response);
          // Handle your success logic here
        }
      } catch (error) {
        console.error("Catch error=",error);
      }
    };

    // Call the function
    fetchData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<RegistrationForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
