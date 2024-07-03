// src/views/admin/InterfaceEquipe/components/GpsPositionSimplified.js
import React, { useEffect, useState } from 'react';
import { Box, Alert, AlertIcon, Text } from '@chakra-ui/react';
import { Geolocation } from '@capacitor/geolocation';
import { useTeam } from './../TeamContext'; // Import the useTeam hook
import { supabase } from './../../../../supabaseClient'; // Import Supabase client

const GpsPositionSimplified = () => {
  const { selectedTeam } = useTeam(); // Access the selected team using the hook
  const [gpsPosition, setGpsPosition] = useState(null); // State to store the GPS position
  const [lastUpdateTime, setLastUpdateTime] = useState(null); // Store the last update time

  // Function to update latitude and longitude coordinates in the database
  const updateCoordinates = async (teamName, latitude, longitude) => {
    try {
      const { data, error } = await supabase
        .from('vianney_teams')
        .update({ latitude, longitude })
        .eq('name_of_the_team', teamName);
      if (error) {
        throw error;
      }
      console.log('Coordinates updated successfully:', data);
    } catch (error) {
      console.error('Error updating coordinates:', error.message);
    }
  };

  useEffect(() => {
    const getCurrentPosition = async () => {
      try {
        const hasPermission = await Geolocation.requestPermissions();

        if (hasPermission.location === 'granted') {
          const position = await Geolocation.getCurrentPosition();
          setGpsPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } else {
          console.error('Location permission not granted');
        }
      } catch (error) {
        console.error('Error getting current position:', error);
      }
    };

    getCurrentPosition();

    const watchPosition = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        setGpsPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else if (err) {
        console.error('Error watching position:', err);
      }
    });

    return () => {
      if (watchPosition) {
        Geolocation.clearWatch({ id: watchPosition });
      }
    };
  }, []);

  useEffect(() => {
    if (!gpsPosition) {
      return;
    }

    const { latitude, longitude } = gpsPosition;

    // Update coordinates in the database if a team is selected and 2 seconds have passed since the last update
    if (selectedTeam && (!lastUpdateTime || (Date.now() - lastUpdateTime) >= 2000)) {
      updateCoordinates(selectedTeam, latitude, longitude);
      setLastUpdateTime(Date.now());
    }
  }, [gpsPosition, selectedTeam, lastUpdateTime]);

  return (
    <Box style={{ display: 'none' }}>
      {gpsPosition ? (
        <Text>
          Latitude: {gpsPosition.latitude}, Longitude: {gpsPosition.longitude}
        </Text>
      ) : (
        <Alert status="info" mt={4}>
          <AlertIcon />
          Merci d'autoriser la géolocalisation
        </Alert>
      )}
    </Box>
  );
};

export default GpsPositionSimplified;
