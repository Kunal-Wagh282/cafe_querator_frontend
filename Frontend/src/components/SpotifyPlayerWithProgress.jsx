import React, { useEffect, useState } from "react";
import "../styles/SpotifyPlayerWithProgress.css"; // Import the CSS file

const SpotifyPlayerWithProgress = ({ player }) => {
  const [position, setPosition] = useState(0); // Current playback position (ms)
  const [duration, setDuration] = useState(0); // Total song duration (ms)
  const [isPaused, setIsPaused] = useState(false); // Playback state

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (newPosition) => {
    if (player) {
      player.seek(newPosition).catch((error) => {
        console.error("Error seeking:", error);
      });
      setPosition(newPosition); // Update the UI immediately
    }
  };

  useEffect(() => {
    let interval;

    if (player) {
      player.addListener("player_state_changed", (state) => {
        if (state) {
          setDuration(state.track_window.current_track.duration_ms);
          setPosition(state.position);
          setIsPaused(state.paused);
        }
      });

      if (!isPaused) {
        interval = setInterval(() => {
          player.getCurrentState().then((state) => {
            if (state) {
              setPosition(state.position);
              setDuration(state.track_window.current_track.duration_ms);
            }
          });
        }, 500);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [player, isPaused]);

  return (
    <div className="spotify-player-container">
      <div className="spotify-player-progress">
        <input
          type="range"
          min="0"
          max={duration}
          value={position}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <span className="spotify-player-time">
          {formatTime(position)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default SpotifyPlayerWithProgress;
