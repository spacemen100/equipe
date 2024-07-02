// GPSPositionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const GPSPositionContext = createContext();

// Create a provider component to manage GPS position
export const GPSPositionProvider = ({ children }) => {
  const [gpsPosition, setGPSPosition] = useState(null);

  useEffect(() => {
    // Use the geolocation API to get the GPS position
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (newPosition) => {
          const { latitude, longitude } = newPosition.coords;
          setGPSPosition({ latitude, longitude });
        },
        (error) => {
          // Handle errors if needed
          console.error('Error getting GPS position:', error);
        },
        {
          enableHighAccuracy: true, // Use high accuracy if available
          timeout: 5000, // Timeout after 5 seconds
          maximumAge: 0 // Don't use cached position
        }
      );

      // Cleanup function to clear the watchPosition when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <GPSPositionContext.Provider value={gpsPosition}>
      {children}
    </GPSPositionContext.Provider>
  );
};

// Custom hook to access the GPS position from components
export const useGPSPosition = () => {
  return useContext(GPSPositionContext);
};
