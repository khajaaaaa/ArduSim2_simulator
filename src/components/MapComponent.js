import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, LayersControl, useMapEvent, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import droneIconImage from '../images/drone.png';
import Timeline from './Timeline';
import DroneInfo from './DroneInfo';
import Filters from './Filters';
import './MapComponent.css';

const droneIcon = (size) => L.icon({
  iconUrl: droneIconImage,
  iconSize: [size, size * 0.4],
});

const pointIcon = L.divIcon({
  className: 'point-icon',
  html: '<div class="point-icon"></div>',
  iconSize: [10, 10],
});

const MapComponent = () => {
  const mapRef = useRef(null);
  const drawnItems = useRef(new L.FeatureGroup());
  const [droneData, setDroneData] = useState({});
  const [maxTime, setMaxTime] = useState(0);
  const [minTime, setMinTime] = useState(0);
  const [simulationTime, setSimulationTime] = useState(0);
  const [latestDataTime, setLatestDataTime] = useState(0);
  const [droneColors, setDroneColors] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [iconSize, setIconSize] = useState(50);
  const [filters, setFilters] = useState({});
  const [distance, setDistance] = useState(null);
  const [isManualZoom, setIsManualZoom] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/data.json');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      if (!data.length) {
        setDroneData({});
        setMaxTime(0);
        setMinTime(0);
        setLatestDataTime(0);
        setDroneColors({});
        return;
      }

      const filteredData = data.filter(item => item.time_boot_ms > 0);
      const groupedData = filteredData.reduce((acc, item) => {
        if (!acc[item.drone_id]) acc[item.drone_id] = [];
        acc[item.drone_id].push({
          ...item,
          coordinates: [item.position.lat, item.position.lon],
          popupText: `Drone ID: ${item.drone_id}, Time: ${item.time_boot_ms}`,
        });
        return acc;
      }, {});

      for (const droneId in groupedData) {
        groupedData[droneId].sort((a, b) => a.time_boot_ms - b.time_boot_ms);
      }

      const allTimes = filteredData.map(item => item.time_boot_ms);
      const newMaxTime = Math.max(...allTimes);
      const newMinTime = Math.min(...allTimes);

      setDroneData(groupedData);
      setMaxTime(newMaxTime);
      setMinTime(newMinTime);
      setLatestDataTime(newMaxTime);

      if (isLiveMode) {
        setSimulationTime(newMaxTime);
      }

      const uniqueDroneIds = Object.keys(groupedData);
      const colorMap = {};
      uniqueDroneIds.forEach((droneId, index) => {
        colorMap[droneId] = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
      });
      setDroneColors(colorMap);

    } catch (error) {
      console.error('Failed to fetch data:', error.message);
      setDroneData({});
      setMaxTime(0);
      setMinTime(0);
      setLatestDataTime(0);
      setDroneColors({});
    }
  }, [isLiveMode]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getCurrentDroneData = useCallback((time) => {
    const currentData = {};
    Object.keys(droneData).forEach(droneId => {
      currentData[droneId] = droneData[droneId].filter(item => item.time_boot_ms <= time);
    });
    return currentData;
  }, [droneData]);

  useEffect(() => {
    if (selectedDrone && droneData[selectedDrone.drone_id]) {
      const updatedDrone = droneData[selectedDrone.drone_id]
        .slice()
        .sort((a, b) => Math.abs(simulationTime - a.time_boot_ms) - Math.abs(simulationTime - b.time_boot_ms))[0];
      setSelectedDrone(updatedDrone);
    }
  }, [droneData, selectedDrone, simulationTime]);

  const startSimulation = useCallback(() => {
    setIsPlaying(true);
    const id = setInterval(() => {
      setSimulationTime((prevTime) => {
        if (isLiveMode) {
          return latestDataTime;
        }
        if (prevTime >= maxTime) {
          clearInterval(id);
          setIsPlaying(false);
          return maxTime;
        }
        return prevTime + 1000;
      });
    }, 1000);
    setIntervalId(id);
  }, [maxTime, isLiveMode, latestDataTime]);

  const stopSimulation = useCallback(() => {
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const resetSimulation = useCallback(() => {
    setSimulationTime(minTime);
    setIsPlaying(false);
    setIsLiveMode(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [minTime, intervalId]);

  const handleTimeChange = useCallback((event) => {
    const newTime = Number(event.target.value);
    setSimulationTime(newTime);
    setIsLiveMode(false);
    if (isPlaying) {
      stopSimulation();
    }
  }, [isPlaying, stopSimulation]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const applyFilters = (drone) => {
    const { position, altitude, speed, battery, flightMode, status } = filters;
    return (!position || drone.position.includes(position)) &&
           (!altitude || drone.altitude === Number(altitude)) &&
           (!speed || drone.speed === Number(speed)) &&
           (!battery || drone.battery === Number(battery)) &&
           (!flightMode || drone.flight_mode.includes(flightMode)) &&
           (!status || drone.status.includes(status));
  };

  const MapClickHandler = () => {
    useMapEvent('click', () => setSelectedDrone(null));
    return null;
  };

  const ZoomHandler = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position && !isManualZoom) {
        map.setView(position, 15);
      }
    }, [map, position, isManualZoom]);

    useMapEvent('zoomstart', () => setIsManualZoom(true));
    useMapEvent('zoomend', () => {
      if (map.getZoom() === 15) {
        setIsManualZoom(false);
      }
    });

    return null;
  };

  const onCreated = (e) => {
    const { layerType, layer } = e;
    drawnItems.current.addLayer(layer);

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

  const currentDroneData = getCurrentDroneData(simulationTime);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '0%' }}>
          <Filters onFilterChange={handleFilterChange} />
        </div>
        <MapContainer ref={mapRef} center={[39.4699, -0.3763]} zoom={6} style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/intl/en-US_US/help/terms_maps.html">Google Maps</a>'
                subdomains={['0', '1', '2', '3']}
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
          {Object.entries(currentDroneData).map(([droneId, positions]) => {
            const filteredPositions = positions.filter(applyFilters);
            const polylinePositions = filteredPositions.map(position => position.coordinates);
            const color = droneColors[droneId];

            return (
              <React.Fragment key={droneId}>
                {filteredPositions.map((position, index) => (
                  <Marker
                    key={`${droneId}-${index}`}
                    position={position.coordinates}
                    icon={index === filteredPositions.length - 1 ? droneIcon(iconSize) : pointIcon}
                    eventHandlers={{ click: () => setSelectedDrone({ ...position, drone_id: droneId }) }}
                  />
                ))}
                {polylinePositions.length > 0 && <Polyline positions={polylinePositions} color={color} />}
              </React.Fragment>
            );
          })}
          <MapClickHandler />
          {selectedDrone && <ZoomHandler position={selectedDrone.coordinates} />}
        </MapContainer>
        {selectedDrone && currentDroneData[selectedDrone.drone_id] && (
          <DroneInfo
            selectedDrone={selectedDrone}
            trajectory={currentDroneData[selectedDrone.drone_id]}
          />
        )}
      </div>
      <Timeline
        simulationTime={simulationTime}
        latestDataTime={latestDataTime}
        maxTime={maxTime}
        minTime={minTime}
        handleTimeChange={handleTimeChange}
        startSimulation={startSimulation}
        stopSimulation={stopSimulation}
        resetSimulation={resetSimulation}
        isPlaying={isPlaying}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
      />
    </div>
  );
};

export default MapComponent;
