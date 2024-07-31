import React from 'react';
import './MapComponent.css';

const Timeline = ({
  simulationTime,
  latestDataTime,
  maxTime,
  minTime,
  handleTimeChange,
  startSimulation,
  stopSimulation,
  resetSimulation,
  isPlaying,
  isLiveMode,
  setIsLiveMode
}) => {
  const formatTime = (ms) => {
    if (isNaN(ms) || ms === null || ms === undefined) return 'No data';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeFormatted = formatTime(simulationTime);
  const totalDurationFormatted = formatTime(maxTime - minTime);

  const isTimeValid = !isNaN(simulationTime) && !isNaN(maxTime) && !isNaN(minTime);

  return (
    <div className="timeline-container">
      {isTimeValid ? (
        <input
          type="range"
          min={minTime}
          max={maxTime}
          value={simulationTime}
          onChange={handleTimeChange}
          className="timeline-slider"
        />
      ) : (
        <div className="timeline-placeholder">Timeline not available</div>
      )}
      <div className="timeline-info">
        <span>Current Time: {currentTimeFormatted}</span>
        <span>Total Duration: {totalDurationFormatted}</span>
      </div>
      <div className="timeline-controls">
        <button onClick={isPlaying ? stopSimulation : startSimulation} disabled={!isTimeValid}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={resetSimulation} disabled={!isTimeValid}>Reset</button>
        <button onClick={() => setIsLiveMode(!isLiveMode)}>
          {isLiveMode ? 'Exit Live' : 'Go Live'}
        </button>
      </div>
      <div className="timeline-mode">
        Mode: {isLiveMode ? 'Live' : 'Historical'}
      </div>
    </div>
  );
};

export default Timeline;