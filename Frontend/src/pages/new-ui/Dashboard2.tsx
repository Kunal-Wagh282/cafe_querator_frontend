import React, { useState } from 'react';
import { Bell, UserPlus, ArrowRight, Music4 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

  const CLIENT_ID = "44c18fde03114e6db92a1d4deafd6a43"; // Your Spotify client ID
  const REDIRECT_URI = "http://localhost:5173/dashboard"; // Redirect URI after Spotify login
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "code"; // Using authorization code flow
  const SCOPE = "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state"; // Add necessary scopes

export default function Dashboard2() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="h-screen w-screen bg-gray-900 text-white p-4">
      <header className="flex spotify-gradient rounded-lg p-4 justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Spotivity</h1>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-white" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
      </header>
      <main className="space-y-6">
        <div className="bg-gray-800 text-center rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Hello Harkirat!!</h2>
        </div>

        <div className=" w-fit rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold">Join a Room</h3>
          <p className="text-sm text-gray-400">Please enter the room code</p>
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="abc-def-ghi" 
              className="bg-gray-700 border-gray-600 flex-grow"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-fit rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold">Create a Room</h3>
          <p className="text-sm text-gray-400">Spotivity Premium is required to create a room</p>
          <Button className="w-full bg-green-500 hover:bg-green-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <a
        href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
      >
        Login to Spotify
      </a>

          </Button>
        </div>

      </main>

      <footer className="mt-6 w-fit">
        <div className="flex bg-gray-800 rounded-lg overflow-hidden items-center">
          <div className="bg-gray-700 p-2 rounded-l-lg">
            <Music4 className="h-5 w-5 text-gray-400" />
          </div>
          <Input 
            type="text" 
            placeholder="abc-def-ghi" 
            className="bg-gray-700 border-gray-600 rounded-none flex-grow"
          />
          <Button variant="ghost" size="icon" className="rounded-l-none">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
