import { useEffect, useRef, useCallback } from 'react';

const colors = [
  'blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink', 'yellow', 'cyan', 'magenta',
  'teal', 'lime', 'indigo', 'violet', 'gold', 'silver', 'bronze', 'coral', 'turquoise', 'navy',
  'maroon', 'olive', 'chocolate', 'salmon', 'plum', 'orchid', 'tan', 'lavender', 'beige', 'azure',
  'crimson', 'khaki', 'peach', 'mint', 'aqua', 'apricot', 'amber', 'emerald', 'jade', 'sapphire',
  'ruby', 'rose', 'periwinkle', 'umber', 'emerald', 'charcoal', 'denim', 'fuchsia', 'amethyst'
];



const useFetchDroneData = (setDroneData, setMaxTime, setMinTime, setDroneColors, setCurrentTime, isPlaying, isScrubbing) => {
  const allDataRef = useRef({});

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/data.json');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const newData = await response.json();
      
      setDroneData(prevData => {
        const updatedData = { ...prevData };
        if (!updatedData[newData.drone_id]) {
          updatedData[newData.drone_id] = [];
        }
        updatedData[newData.drone_id].push({
          ...newData,
          coordinates: [newData.position.lat, newData.position.lon],
          popupText: `Drone ID: ${newData.drone_id}, Time: ${newData.time_boot_ms}`,
        });
        return updatedData;
      });
  
      setLatestDataTime(prevTime => Math.max(prevTime, newData.time_boot_ms));
      setMaxTime(prevMax => Math.max(prevMax, newData.time_boot_ms));
      setMinTime(prevMin => prevMin === 0 ? newData.time_boot_ms : Math.min(prevMin, newData.time_boot_ms));
  
      if (isLiveMode) {
        setSimulationTime(newData.time_boot_ms);
      }
  
      // Update drone colors if needed
      setDroneColors(prevColors => {
        if (!prevColors[newData.drone_id]) {
          const newColor = `hsl(${Object.keys(prevColors).length * 137.5 % 360}, 70%, 50%)`;
          return { ...prevColors, [newData.drone_id]: newColor };
        }
        return prevColors;
      });
  
    } catch (error) {
      console.error('Failed to fetch data:', error.message);
    }
  }, [isLiveMode]);

  useEffect(() => {
    fetchData(); // Fetch data initially
    const interval = setInterval(fetchData, 1000); // Fetch data every second
    return () => clearInterval(interval); // Cleanup interval on component unmount or dependency change
  }, [fetchData]);

  return allDataRef.current;
};

export default useFetchDroneData;


