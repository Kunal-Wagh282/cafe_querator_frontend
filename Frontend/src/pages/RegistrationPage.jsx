import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrationPage.css'; 
import registrationImage from '../images/RegistrationPage.png'; 
import API_URL from '../config'; // Import the API URL

const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    CafeName: '',
    cafeAddress: '',
    cafeContact: '',
    ownerName: '',
    ownerContact: '',
    no_of_Tables: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    const { CafeName, cafeAddress, cafeContact, ownerName, ownerContact, no_of_Tables } = formData;

    if (!CafeName || !cafeAddress || !cafeContact || !ownerName || !ownerContact || !no_of_Tables) {
      alert('Please fill out all fields before proceeding.');
      return;
    }

    setStep(2); // Move to Step 2 after all fields are filled
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, CafeName, cafeAddress, cafeContact, ownerName, ownerContact, no_of_Tables } = formData;

    // Check for missing fields or mismatched passwords
    if (!username || !password || !confirmPassword) {
      alert('Please fill out all fields before registering.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Send the user and cafe details to the backend
      const response = await axios.post(`${API_URL}/register`, {
        email: username,  // Change 'username' to 'email'
        password,
        cafe_info: {
          Cafe_Name: CafeName,            // Change 'CafeName' to 'Cafe_Name'
          Cafe_Address: cafeAddress,      // Change 'cafeAddress' to 'Cafe_Address'
          Cafe_Contact: cafeContact,      // Change 'cafeContact' to 'Cafe_Contact'
          Owner_Name: ownerName,          // Change 'ownerName' to 'Owner_Name'
          Owner_Contact: ownerContact,    // Change 'ownerContact' to 'Owner_Contact'
          No_of_Tables: no_of_Tables      // Change 'no_of_Tables' to 'No_of_Tables'
        },
      });

      // If the API response is successful, navigate to the Spotify login page
      if (response.status === 201 || response.status === 200) {
        console.log('Registration successful:', response.data);
        navigate('/');  // Redirect to the Spotify login page
      }

    } catch (error) {
      // Handle registration failure
      console.error('There was an error with registration:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="registration-content">
      <div className="registration-image">
        <img src={registrationImage} alt="Cafe Illustration" />
      </div>
      <div className="registration-form-container">
        {step === 1 ? (
          <>
            <h2>Register Your Cafe</h2>
            <form onSubmit={handleNext}>
              <input
                type="text"
                placeholder="Cafe Name"
                name="CafeName"
                value={formData.CafeName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Cafe Address"
                name="cafeAddress"
                value={formData.cafeAddress}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Cafe Contact"
                name="cafeContact"
                value={formData.cafeContact}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Owner Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Owner Contact"
                name="ownerContact"
                value={formData.ownerContact}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                placeholder="Number of Tables"
                name="no_of_Tables"
                value={formData.no_of_Tables}
                onChange={handleChange}
                required
              />
              <button type="submit">Next</button>
            </form>
          </>
        ) : (
          <>
            <h2>Create Your Account</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="submit">Register</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
