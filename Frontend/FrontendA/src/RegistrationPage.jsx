import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationPage.css'; // Import the CSS file for styling
import registrationImage from './RegistrationPage.png'; // Import your registration image

const RegistrationPage = () => {
  const [step, setStep] = useState(1); // Track which part of the form is displayed
  const [formData, setFormData] = useState({
    cafeName: '',
    cafeAddress: '',
    cafeContact: '',
    ownerName: '',
    ownerContact: '',
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

    // Check if all fields in the current step are filled out
    const { cafeName, cafeAddress, cafeContact, ownerName, ownerContact } = formData;

    if (!cafeName || !cafeAddress || !cafeContact || !ownerName || !ownerContact) {
      alert('Please fill out all fields before proceeding.');
      return;
    }

    // Move to the next step
    setStep(2);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Check if all fields in the registration step are filled out
    const { username, password, confirmPassword } = formData;

    if (!username || !password || !confirmPassword) {
      alert('Please fill out all fields before registering.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Handle registration logic here
    console.log('Registration successful', formData);
    navigate('/spotify-login'); // Navigate to the login page after registration
  };

  return (
    <div className="registration-content">
      <div className="registration-image">
        <img src={registrationImage} alt="Cafe Illustration" /> {/* Use the imported image */}
      </div>
      <div className="registration-form-container">
        {step === 1 ? (
          <>
            <h2>Register Your Cafe</h2>
            <form onSubmit={handleNext}>
              <input
                type="text"
                placeholder="Cafe Name"
                name="cafeName"
                value={formData.cafeName}
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
