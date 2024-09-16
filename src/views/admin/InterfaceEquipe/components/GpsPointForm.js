import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEvent } from './../../../../EventContext';
import { supabase } from './../../../../supabaseClient';  // Importez le client Supabase

// Correction icônes Leaflet dans React
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

const GpsPointForm = () => {
  const { selectedEventId, selectedEventName, setEvent } = useEvent();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [loading, setLoading] = useState(false); // Ajouter un indicateur de chargement
  const [error, setError] = useState(null); // Ajouter un état pour gérer les erreurs
  const toast = useToast(); // Initialisation du toast Chakra UI

  const handleMapClick = (e) => {
    setLatitude(e.latlng.lat);
    setLongitude(e.latlng.lng);
  };

  const handleSubmit = async () => {
    if (selectedEventId) {
      try {
        setLoading(true);
        setError(null);

        // Envoyer les coordonnées à Supabase
        const { data, error } = await supabase
          .from('vianney_event')
          .update({
            latitude: latitude,
            longitude: longitude,
          })
          .eq('event_id', selectedEventId);

        if (error) throw error;

        // Mettre à jour le contexte local
        setEvent(selectedEventId, selectedEventName, latitude, longitude);
        console.log('Event updated in Supabase:', data);

        // Affichage du toast en cas de succès
        toast({
          title: "Coordonnées GPS sauvegardées.",
          description: "Les coordonnées GPS ont été mises à jour avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

      } catch (err) {
        console.error('Error updating event:', err);
        setError('Une erreur est survenue lors de la mise à jour de l\'événement.');

        // Affichage du toast en cas d'erreur
        toast({
          title: "Erreur lors de la mise à jour.",
          description: "Une erreur est survenue lors de la mise à jour des coordonnées GPS.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearGps = async () => {
    if (selectedEventId) {
      try {
        setLoading(true);
        setError(null);

        // eslint-disable-next-line
        const { data, error } = await supabase
          .from('vianney_event')
          .update({
            latitude: null,
            longitude: null,
          })
          .eq('event_id', selectedEventId);

        if (error) throw error;

        // Mettre à jour le contexte local avec les valeurs nulles
        setEvent(selectedEventId, selectedEventName, null, null);
        setLatitude(0); // Réinitialiser les valeurs dans le formulaire
        setLongitude(0);

        // Affichage du toast en cas de succès
        toast({
          title: "Coordonnées GPS effacées.",
          description: "Les coordonnées GPS ont été effacées avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

      } catch (err) {
        console.error('Error clearing GPS coordinates:', err);
        setError('Une erreur est survenue lors de l\'effacement des coordonnées GPS.');

        // Affichage du toast en cas d'erreur
        toast({
          title: "Erreur lors de l'effacement.",
          description: "Une erreur est survenue lors de l'effacement des coordonnées GPS.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click: handleMapClick,
    });

    return latitude !== 0 && longitude !== 0 ? (
      <Marker position={[latitude, longitude]} icon={defaultIcon} />
    ) : null;
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box height="400px">
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </Box>

      <FormControl display="none">
        <FormLabel>Latitude</FormLabel>
        <Input value={latitude} isReadOnly />
      </FormControl>

      <FormControl display="none">
        <FormLabel>Longitude</FormLabel>
        <Input value={longitude} isReadOnly />
      </FormControl>

      <Button colorScheme="teal" onClick={handleSubmit} isLoading={loading}>
        Centrer la carte sur ces coordonnées GPS
      </Button>

      <Button colorScheme="red" onClick={handleClearGps} isLoading={loading} mt={2}>
        Effacer les coordonnées GPS
      </Button>

      {error && <Box color="red.500">{error}</Box>}
    </VStack>
  );
};

export default GpsPointForm;