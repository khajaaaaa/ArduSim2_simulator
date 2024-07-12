import React, { useState } from "react";
import CesiumMap from './CesiumMap';
import './MapComponent.css'; 

const truncateDecimal = (number) => {
  if (typeof number === 'number') {
    // Check if number is exactly 0
    if (number === 0) {
      return '0'; // Return '0' as string
    } else {
      return number.toFixed(6).replace(/\.?0*$/, ''); // Remove trailing zeros if present
    }
  }
  return number; // Return as is if not a number
};

const DroneInfo = ({ selectedDrone, selectedTime, trajectory }) => {
  const [showCesiumMap, setShowCesiumMap] = useState(false);

  const handleClick = () => {
    setShowCesiumMap(!showCesiumMap);
  };

  return (
    <div className="drone-info-container">
      <h2>Drone Information</h2>
      <p><strong>Drone ID:</strong> {selectedDrone.drone_id}</p>
      <p><strong>Time Boot MS:</strong> {selectedTime}</p>
      <p><strong>Position:</strong></p>
      <ul>
        <li><strong>Latitude:</strong> {truncateDecimal(selectedDrone.position.lat)}</li>
        <li><strong>Longitude:</strong> {truncateDecimal(selectedDrone.position.lon)}</li>
        <li><strong>Altitude:</strong> {truncateDecimal(selectedDrone.position.alt)}</li>
        <li><strong>Heading:</strong> {truncateDecimal(selectedDrone.position.heading)}</li>
        <li><strong>Relative Altitude:</strong> {truncateDecimal(selectedDrone.position.relative_alt)}</li>
      </ul>
      <p><strong>Battery:</strong> {selectedDrone.battery}%</p>
      <p><strong>Status:</strong> {selectedDrone.status}</p>
      <p><strong>Flight Mode:</strong> {selectedDrone.flight_mode}</p>
      <p><strong>Speed:</strong></p>
      <ul>
        <li><strong>VX:</strong> {truncateDecimal(selectedDrone.speed.vx)}</li>
        <li><strong>VY:</strong> {truncateDecimal(selectedDrone.speed.vy)}</li>
        <li><strong>VZ:</strong> {truncateDecimal(selectedDrone.speed.vz)}</li>
      </ul>
      <div>
        <button onClick={handleClick}>{showCesiumMap ? 'Close 3D View' : 'Show 3D View'}</button>
      </div>
      {showCesiumMap && (
        <div className="cesium-overlay">
          <button onClick={handleClick}>Close 3D View</button>
          <CesiumMap droneData={selectedDrone} trajectory={trajectory || []} />
        </div>
      )}
    </div>
  );
};

export default DroneInfo;
