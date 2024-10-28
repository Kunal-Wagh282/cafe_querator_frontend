import React ,{ useState, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Users2, Music, Trash2, ChevronUp, ChevronDown } from "lucide-react"

type Song = {
  id: string;
  title: string;
  artist: string;
}

export default function MusicRoomAdmin() {
  const [queue, setQueue] = useState<Song[]>([
    { id: '1', title: 'Song 1', artist: 'Artist 1' },
    { id: '2', title: 'Song 2', artist: 'Artist 2' },
    { id: '3', title: 'Song 3', artist: 'Artist 3' },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Song[]>([])

  useEffect(() => {
    if (searchQuery) {
      // Simulating API call for song suggestions
      const mockSuggestions = [
        { id: '4', title: 'Suggested Song 1', artist: 'Suggested Artist 1' },
        { id: '5', title: 'Suggested Song 2', artist: 'Suggested Artist 2' },
        { id: '6', title: 'Suggested Song 3', artist: 'Suggested Artist 3' },
      ]
      setSuggestions(mockSuggestions)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  const moveSong = (index: number, direction: 'up' | 'down') => {
    const newQueue = [...queue]
    if (direction === 'up' && index > 0) {
      [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]]
    } else if (direction === 'down' && index < queue.length - 1) {
      [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]]
    }
    setQueue(newQueue)
  }

  const removeSong = (id: string) => {
    setQueue(queue.filter(song => song.id !== id))
  }

  const addToQueue = (song: Song) => {
    setQueue([...queue, song])
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Music Room Admin</h1>
          <Button variant="destructive">Leave</Button>
        </header>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Queue</h2>
              <div className="flex mb-4">
                <Input
                  type="text"
                  placeholder="Search for a song"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button className="ml-2">
                  <Music size={20} />
                </Button>
              </div>
              {suggestions.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {suggestions.map((song) => (
                    <li key={song.id} className="bg-gray-700 p-2 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                      </div>
                      <Button size="sm" onClick={() => addToQueue(song)}>Add</Button>
                    </li>
                  ))}
                </ul>
              )}
              <ul className="space-y-2">
                {queue.map((song, index) => (
                  <li key={song.id} className="bg-gray-700 p-2 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" onClick={() => moveSong(index, 'up')} disabled={index === 0}>
                        <ChevronUp size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => moveSong(index, 'down')} disabled={index === queue.length - 1}>
                        <ChevronDown size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeSong(song.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
            <div className="flex-grow">
              {/* Placeholder for album art or video */}
              <div className="bg-gray-700 w-full h-64 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Now Playing</h2>
              <p className="text-gray-400">Song Title - Artist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}