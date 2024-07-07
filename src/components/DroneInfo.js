import React, { useState } from "react";
import CesiumMap from './CesiumMap';

const DroneInfo = ({ selectedDrone, selectedTime, trajectory }) => {
  const [showCesiumMap, setShowCesiumMap] = useState(false);

  const handleClick = () => {
    setShowCesiumMap(!showCesiumMap);
  };

  return (
    <div style={{ width: '20%', padding: '10px', backgroundColor: 'white', borderLeft: '1px solid #ccc' }}>
      <h2>Drone Information</h2>
      <p><strong>Drone ID:</strong> {selectedDrone.drone_id}</p>
      <p><strong>Time Boot MS:</strong> {selectedTime}</p>
      <p><strong>Position:</strong></p>
      <ul>
        <li><strong>Latitude:</strong> {selectedDrone.position.lat}</li>
        <li><strong>Longitude:</strong> {selectedDrone.position.lon}</li>
        <li><strong>Altitude:</strong> {selectedDrone.position.alt}</li>
        <li><strong>Heading:</strong> {selectedDrone.position.heading}</li>
        <li><strong>Relative Altitude:</strong> {selectedDrone.position.relative_alt}</li>
      </ul>
      <p><strong>Battery:</strong> {selectedDrone.battery}%</p>
      <p><strong>Status:</strong> {selectedDrone.status}</p>
      <p><strong>Flight Mode:</strong> {selectedDrone.flight_mode}</p>
      <p><strong>Speed:</strong></p>
      <ul>
        <li><strong>VX:</strong> {selectedDrone.speed.vx}</li>
        <li><strong>VY:</strong> {selectedDrone.speed.vy}</li>
        <li><strong>VZ:</strong> {selectedDrone.speed.vz}</li>
      </ul>
      <div>
        <button onClick={handleClick}>Show 3D View</button>
      </div>
      {showCesiumMap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
        }}>
          <button onClick={handleClick} style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1001,
            backgroundColor: 'white',
            padding: '10px',
            border: 'none',
            cursor: 'pointer'
          }}>Close 3D View</button>
          <CesiumMap droneData={selectedDrone} trajectory={trajectory || []} />
        </div>
      )}
    </div>
  );
};

export default DroneInfo;
