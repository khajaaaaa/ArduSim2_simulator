import React from 'react';
import './MapComponent.css';

const Timeline = ({ currentTime, maxTime, minTime, handleTimeChange, startSimulation, stopSimulation, resetSimulation, isPlaying, handleScrubEnd }) => {
  return (
    <div className="timeline-container">
      <input
        type="range"
        min={minTime}
        max={maxTime}
        value={currentTime}
        onChange={handleTimeChange}
        onMouseUp={handleScrubEnd}
      />
      <div>Current Time: {currentTime}</div>
      <button onClick={startSimulation} >Play Simulation</button>
      <button onClick={stopSimulation}>Stop Simulation</button>
      <button onClick={resetSimulation}>Reset Simulation</button>
    </div>
  );
};

export default Timeline;
