import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpotifyLoginPage = () => {
  const CLIENT_ID = "44c18fde03114e6db92a1d4deafd6a43";
  const REDIRECT_URI = "http://localhost:5173/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const BACKEND_API = "http://localhost:8000/api/save-token"; // Change this to your backend endpoint
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      // Extract the access token from the URL hash
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);

      // Send the access token to your backend
      sendTokenToBackend(token);
    }

    setToken(token);
  }, []);

  const sendTokenToBackend = async (token) => {
    try {
      const response = await axios.post(BACKEND_API, { token });
      console.log('Token successfully sent to backend:', response.data);
    } catch (error) {
      console.error('Error sending token to backend:', error);
      alert('Failed to send token to the server.');
    }
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: searchKey,
          type: "artist"
        }
      });

      setArtists(data.artists.items);
    } catch (error) {
      console.error("Error fetching artists:", error);
      alert("Failed to fetch artists. Please try again.");
    }
  };

  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt={artist.name} /> : <div>No Image</div>}
        <div>{artist.name}</div>
      </div>
    ));
  };

  return (
    <div>
      <h1>Spotify Login</h1>
      {!token ? (
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
          Login to Spotify
        </a>
      ) : (
        <button onClick={logout}>Logout</button>
      )}

      {token ? (
        <form onSubmit={searchArtists}>
          <input
            type="text"
            placeholder="Search for artists"
            onChange={e => setSearchKey(e.target.value)}
            value={searchKey}
          />
          <button type="submit">Search</button>
        </form>
      ) : (
        <h2>Please login</h2>
      )}

      <div>
        {renderArtists()}
      </div>
    </div>
  );
};

export default SpotifyLoginPage;
