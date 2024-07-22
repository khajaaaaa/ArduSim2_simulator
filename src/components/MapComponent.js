import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, LayersControl, useMapEvent, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import droneIconi from '../images/drone.png';
import useFetchDroneData from './useFetchDroneData';
import Timeline from './Timeline';
import DroneInfo from './DroneInfo';
import Filters from './Filters';
import './MapComponent.css';

const droneIcon = (size) => L.icon({
  iconUrl: droneIconi,
  iconRetinaUrl: droneIconi,
  shadowUrl: droneIconi,
  iconSize: [size, size * 0.4],
  shadowSize: [size, size * 0.4],
});

const pointIcon = L.divIcon({
  className: 'my-div-icon',
  html: '<div class="my-div-icon"></div>',
  iconSize: [10, 10],
});

const MapComponent = () => {
  const mapRef = useRef(null);
  const drawnItems = useRef(new L.FeatureGroup());
  const [droneData, setDroneData] = useState({});
  const [maxTime, setMaxTime] = useState(0);
  const [minTime, setMinTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [droneColors, setDroneColors] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [iconSize, setIconSize] = useState(50);
  const [filters, setFilters] = useState({});
  const [distance, setDistance] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useFetchDroneData(setDroneData, setMaxTime, setMinTime, setDroneColors, setCurrentTime, isPlaying);

  useEffect(() => {
    if (selectedDrone && droneData[selectedDrone.drone_id]) {
      const updatedDrone = droneData[selectedDrone.drone_id]
        .slice()
        .sort((a, b) => Math.abs(currentTime - a.time_boot_ms) - Math.abs(currentTime - b.time_boot_ms))[0];
      setSelectedDrone(updatedDrone);
      setSelectedTime(currentTime);
    } else {
      setSelectedDrone(null);
      setSelectedTime(null);
    }
  }, [droneData, selectedDrone, currentTime]);

  useEffect(() => {
    if (minTime !== 0) {
      setCurrentTime(minTime);
    }
  }, [minTime]);

  const startSimulation = useCallback(() => {
    setIsPlaying(true);
    const id = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime < maxTime) {
          return prevTime + 1000;
        } else {
          clearInterval(id);
          setIsPlaying(false);
          return prevTime;
        }
      });
    }, 1000);
    setIntervalId(id);
  }, [maxTime]);

  const stopSimulation = useCallback(() => {
    setIsPlaying(true);
    const id = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime < maxTime) {
          return prevTime;
        } else {
          clearInterval(id);
          setIsPlaying(false);
          return prevTime;
        }
      });
    }, 1000);
    setIntervalId(id);
  }, [maxTime]);

  const resetSimulation = useCallback(() => {
    setCurrentTime(maxTime);
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [maxTime, intervalId]);

  const handleTimeChange = useCallback((event) => {
    const newTime = Number(event.target.value);
    setCurrentTime(newTime);
    setIsScrubbing(true);
    if (isPlaying) {
      stopSimulation();
    }
  }, [isPlaying, stopSimulation]);

  const handleScrubEnd = useCallback(() => {
    setIsScrubbing(false);
    if (isPlaying) {
      startSimulation();
    }
  }, [isPlaying, startSimulation]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const applyFilters = (drone) => {
    const { position, altitude, speed, battery, flightMode, status } = filters;
    const matchesPosition = !position || drone.position.includes(position);
    const matchesAltitude = !altitude || drone.altitude === Number(altitude);
    const matchesSpeed = !speed || drone.speed === Number(speed);
    const matchesBattery = !battery || drone.battery === Number(battery);
    const matchesFlightMode = !flightMode || drone.flight_mode.includes(flightMode);
    const matchesStatus = !status || drone.status.includes(status);
    return matchesPosition && matchesAltitude && matchesSpeed && matchesBattery && matchesFlightMode && matchesStatus;
  };

  const MapClickHandler = () => {
    useMapEvent('click', () => setSelectedDrone(null));
    return null;
  };

  const ZoomHandler = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, 100);
      }
    }, [map, position]);
    return null;
  };

  const onCreated = (e) => {
    const { layerType, layer } = e;
    const drawnItemsLayer = drawnItems.current;

    drawnItemsLayer.addLayer(layer);

    if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      if (latlngs.length > 1) {
        const distance = latlngs.reduce((acc, curr, idx, arr) => {
          if (idx === 0) return acc;
          return acc + arr[idx - 1].distanceTo(curr);
        }, 0);
        setDistance(distance);
        alert(`Distance: ${distance.toFixed(2)} meters`);
      }
    }

    if (layerType === 'circle') {
      const radius = layer.getRadius();
      alert(`Circle radius: ${radius.toFixed(2)} meters`);
    }
  };

  const onDeleted = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      drawnItems.current.removeLayer(layer);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '0%' }}>
        <Filters onFilterChange={handleFilterChange} />
      </div>
      <MapContainer ref={mapRef} center={[39.4699, -0.3763]} zoom={6} style={{ height: '100%', width: selectedDrone ? '60%' : '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=YOUR_API_KEY"
              attribution='&copy; <a href="https://www.google.com/intl/en-US_US/help/terms_maps.html">Google Maps</a>'
              subdomains={['0', '1', '2', '3']}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Hillshade">
            <TileLayer
              url="https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <FeatureGroup ref={drawnItems}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              rectangle: true,
              polyline: true,
              circle: true,
              marker: false,
              polygon: true,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
        {Object.keys(droneData).map((droneId) => {
          const positions = droneData[droneId].filter(position => position.time_boot_ms <= currentTime);
          const filteredPositions = positions.filter(applyFilters);
          const polylinePositions = filteredPositions.map(position => position.coordinates);
          const color = droneColors[droneId];

          return (
            <React.Fragment key={droneId}>
              {filteredPositions.map((position, index) => (
                <Marker
                  key={index}
                  position={position.coordinates}
                  icon={index === filteredPositions.length - 1 ? droneIcon(iconSize) : pointIcon}
                  eventHandlers={{ click: () => setSelectedDrone(position) }}
                />
              ))}
              {polylinePositions.length > 0 && <Polyline positions={polylinePositions} color={color} />}
            </React.Fragment>
          );
        })}
        <MapClickHandler />
        {selectedDrone && <ZoomHandler position={selectedDrone.coordinates} />}
      </MapContainer>
      {selectedDrone && droneData[selectedDrone.drone_id] && (
        <DroneInfo
          selectedDrone={selectedDrone}
          selectedTime={selectedTime}
          trajectory={droneData[selectedDrone.drone_id].filter(position => position.time_boot_ms <= currentTime)}
        />
      )}
      <Timeline
        currentTime={currentTime}
        maxTime={maxTime}
        minTime={minTime}
        handleTimeChange={handleTimeChange}
        startSimulation={startSimulation}
        stopSimulation={stopSimulation}
        resetSimulation={resetSimulation}
        isPlaying={isPlaying}
        handleScrubEnd={handleScrubEnd}
      />
    </div>
  );
};

export default MapComponent;
