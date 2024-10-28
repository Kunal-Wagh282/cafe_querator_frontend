import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Users2, Music } from "lucide-react";
import axios from 'axios';

export default function MusicRoom() {
  const [songUrl, setSongUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // To store search results
  const [accessToken, setAccessToken] = useState(''); // Ensure you have accessToken available

  // Function to search songs using Spotify API
  const searchSongs = async (query) => {
    if (!accessToken) return [];

    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('Search Response:', response.data); // Log the response data
      return response.data.tracks.items; // Return search results
    } catch (error) {
      console.error('Error searching for songs:', error);
      return []; // Return an empty array on error
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery) {
      const results = await searchSongs(searchQuery);
      console.log(results);
      
      setSearchResults(results); // Store the search results
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto ">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Music Room</h1>
          <Button className="bg-red-500">Leave</Button>
        </header>

        <div className="grid overflow-y-auto bg-gray-900 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 relative">
              <div className="absolute top-2 right-2">
                <Users2 className="text-green-400" size={24} />
              </div>
              <div className="w-48 h-48 mx-auto bg-black rounded-full relative">
                <div className="absolute w-4 h-4 bg-yellow-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-center text-sm">Paste the song link</p>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Enter song URL or ID"
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button className="ml-2">
                    <Music size={20} />
                  </Button>
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Search any song"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button className="ml-2" onClick={handleSearchSubmit}>
                    <Music size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
            <div className="flex-grow">
              {/* Placeholder for album art or video */}
              <div className="bg-gray-700 w-full h-64 rounded-lg"></div>
            </div>
            <div className="mt-4 bg-gray-800 rounded">
              <h2 className="text-lg font-semibold">Now Playing</h2>
              <p className="text-gray-400">Song Title - Artist</p>
            </div>
          </div>

          {/* Display search results */}
          {searchResults.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <ul>
                {searchResults.map((track) => (
                  <li key={track.id} className="text-gray-300">
                    {track.name} by {track.artists.map(artist => artist.name).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}