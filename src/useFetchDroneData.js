import { useEffect, useRef, useCallback } from 'react';

const colors = ['blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink', 'yellow', 'cyan', 'magenta'];

const useFetchDroneData = (setDroneData, setMaxTime, setDroneColors, setCurrentTime, isPlaying) => {
  const previousDataRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/data.json');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (!data.length) {
        // Handle case where data is empty
        setDroneData({});
        setMaxTime(0);
        setCurrentTime(0);
        setDroneColors({});
        return;
      }

      const groupedData = data.reduce((acc, item) => {
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

      const allTimes = data.map(item => item.time_boot_ms);
      const maxTime = Math.max(...allTimes);

      if (JSON.stringify(previousDataRef.current) !== JSON.stringify(groupedData)) {
        setDroneData(groupedData);
        setMaxTime(maxTime);
        setCurrentTime(maxTime); // Set current time to maxTime when new data is fetched

        const uniqueDroneIds = Object.keys(groupedData);
        const colorMap = {};
        uniqueDroneIds.forEach((droneId, index) => {
          colorMap[droneId] = colors[index % colors.length];
        });
        setDroneColors(colorMap);
      }

      previousDataRef.current = groupedData;
    } catch (error) {
      console.error('Failed to fetch data:', error.message);
    }
  }, [setDroneData, setMaxTime, setDroneColors, setCurrentTime]);

  useEffect(() => {
    fetchData(); // Fetch data initially

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount or dependency change
  }, [fetchData, isPlaying]); // Trigger fetchData on isPlaying change or initial load
};

export default useFetchDroneData;
