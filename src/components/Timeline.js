import React from 'react';
import './MapComponent.css';

const Timeline = ({ currentTime, maxTime, minTime, handleTimeChange, startSimulation, stopSimulation, resetSimulation, isPlaying }) => {
  const timePercentage = ((currentTime - minTime) / (maxTime - minTime)) * 100;

  return (
    <div className="timeline-container">
      <input
        type="range"
        min={minTime}
        max={maxTime}
        value={currentTime}
        onChange={handleTimeChange}
      />
      <div>Current Time: {currentTime}</div>
      <button onClick={startSimulation} disabled={isPlaying}>Play Simulation</button>
      <button onClick={stopSimulation} disabled={!isPlaying}>Stop Simulation</button>
      <button onClick={resetSimulation}>Reset Simulation</button>
    </div>
  );
};

export default Timeline;
