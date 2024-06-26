import React from 'react';

const Timeline = ({ currentTime, maxTime, handleTimeChange, startSimulation, stopSimulation, resetSimulation, isPlaying }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      width: '100%',
      textAlign: 'center',
      backgroundColor: 'white',
      zIndex: 1000
    }}>
      <input
        type="range"
        min="0"
        max={maxTime}
        value={currentTime}
        onChange={handleTimeChange}
        style={{ width: '80%' }}
      />
      <div>Current Time: {currentTime}</div>
      <button onClick={startSimulation} disabled={isPlaying}>Play Simulation</button>
      <button onClick={stopSimulation} disabled={!isPlaying}>Stop Simulation</button>
      <button onClick={resetSimulation}>Reset Simulation</button>
    </div>
  );
};

export default Timeline;
