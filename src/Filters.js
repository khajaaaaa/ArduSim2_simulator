import React, { useState } from 'react';

const Filters = ({ onFilterChange }) => {
  const [position, setPosition] = useState('');
  const [altitude, setAltitude] = useState('');
  const [speed, setSpeed] = useState('');
  const [battery, setBattery] = useState('');
  const [flightMode, setFlightMode] = useState('');
  const [status, setStatus] = useState('');

  const handleFilterChange = () => {
    onFilterChange({
      position,
      altitude,
      speed,
      battery,
      flightMode,
      status,
    });
  };

  return (
    <div className="filters">
      <label>
        Position:
        <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
      </label>
      <label>
        Altitude:
        <input type="number" value={altitude} onChange={(e) => setAltitude(e.target.value)} />
      </label>
      <label>
        Speed:
        <input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} />
      </label>
      <label>
        Battery Level:
        <input type="number" value={battery} onChange={(e) => setBattery(e.target.value)} />
      </label>
      <label>
        Flight Mode:
        <input type="text" value={flightMode} onChange={(e) => setFlightMode(e.target.value)} />
      </label>
      <label>
        Status:
        <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
      </label>
      <button onClick={handleFilterChange}>Apply Filters</button>
    </div>
  );
};

export default Filters;
