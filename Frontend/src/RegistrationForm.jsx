import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextInput from './Components/TextInput';
import SubmitButton from './Components/SubmitButton';
import PopupMessage from './Components/PopupMessage'; // Import the PopupMessage component
import { Link, useNavigate } from 'react-router-dom';
import API_URL from './config'; // Import the API URL
function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false); 
  const [countdown, setCountdown] = useState(5); // Initial countdown value
  const [errorMessage, setErrorMessage] = useState(''); // For error messages
  const navigate = useNavigate();


  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      let cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // useEffect(() => {
  //   console.log("CSRF Token Received:", getCookie('csrftoken'));
  // }, []);

  useEffect(() => {
    let intervalId;
    if (redirect) {
      intervalId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [redirect]);



  useEffect(() => {
    if (countdown === 0) {
      setRedirect(false); // Hide the success popup after countdown reaches 0
      navigate('/login'); // Redirect to the login page after successful registration
    }
  }, [countdown, navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: username,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          //'X-CSRFToken': getCSRFToken(),
        },
      });

      if (response.status === 201) {
        console.log('Registration successful');
        setRedirect(true);
        setCountdown(5);
      } else if (response.status === 226) { // Assuming 409 for "Conflict" (Username already exists)
        setErrorMessage('Username already registered');
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setErrorMessage('An error occurred during registration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className='registration-page-container'>
      <div className="registration-form-container">
        <div className="form-content">
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <span className="login100-form-title"><h1>Register</h1></span>
              <TextInput
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                message="Username"
              />
              
              <TextInput
                type="current-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="current-password"
                message="Password"
              />
              <SubmitButton loading={loading} text="Register" elseText="Registering..." />
            </form>

            {errorMessage && <PopupMessage message={errorMessage} />}

            <p>Already registered? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
