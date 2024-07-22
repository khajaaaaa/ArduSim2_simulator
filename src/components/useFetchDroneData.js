import { useEffect, useRef, useCallback } from 'react';

const colors = ['blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink', 'yellow', 'cyan', 'magenta'];

const useFetchDroneData = (setDroneData, setMaxTime, setMinTime, setDroneColors, setCurrentTime, isPlaying) => {
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
        setMinTime(0);
        setCurrentTime(0);
        setDroneColors({});
        return;
      }

      // Filter out entries with zero timestamps
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
      const maxTime = Math.max(...allTimes);
      const minTime = Math.min(...allTimes);

      if (JSON.stringify(previousDataRef.current) !== JSON.stringify(groupedData)) {
        setDroneData(groupedData);
        setMaxTime(maxTime);
        setMinTime(minTime);

        if (!isPlaying) {
          setCurrentTime(maxTime);
        }

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
      // Handle fetch error
      setDroneData({});
      setMaxTime(0);
      setMinTime(0);
      setCurrentTime(0);
      setDroneColors({});
    }
  }, [setDroneData, setMaxTime, setMinTime, setDroneColors, setCurrentTime, isPlaying]);

  useEffect(() => {
    fetchData(); // Fetch data initially

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount or dependency change
  }, [fetchData, isPlaying]); // Trigger fetchData on isPlaying change or initial load
};

export default useFetchDroneData;
