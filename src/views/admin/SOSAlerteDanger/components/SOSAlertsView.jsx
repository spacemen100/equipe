import React, { useState, useEffect } from 'react';
import { supabase } from './../../../../supabaseClient'; // Ajustez l'importation selon la structure de votre projet
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Heading,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RiMapPinUserFill } from "react-icons/ri";
import { useEvent } from './../../../../EventContext'; // Importer le hook useEvent
import ReactDOMServer from 'react-dom/server'; // Importer ReactDOMServer

const SOSAlertsView = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null); // Stocker la localisation sélectionnée
  const { isOpen: isMapOpen, onOpen: onMapOpen, onClose: onMapClose } = useDisclosure(); // Contrôle du modal pour la carte
  const { isOpen: isVideoOpen, onOpen: onVideoOpen, onClose: onVideoClose } = useDisclosure(); // Contrôle du modal pour la vidéo
  const { selectedEventId } = useEvent(); // Obtenir l'ID de l'événement sélectionné à partir du contexte

  useEffect(() => {
    if (selectedEventId) {
      fetchAlerts(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchAlerts = async (eventId) => {
    const { data, error } = await supabase
      .from('vianney_sos_alerts')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des alertes :', error);
    } else {
      setAlerts(data);
    }
  };

  const openMap = (latitude, longitude) => {
    if (latitude && longitude) {
      setSelectedLocation({ latitude, longitude });
      onMapOpen();
    } else {
      console.error("Coordonnées non valides : latitude ou longitude manquante");
    }
  };

  const openVideo = (url) => {
    setSelectedUrl(url);
    onVideoOpen();
  };

  const createCustomIcon = () => {
    return L.divIcon({
      html: ReactDOMServer.renderToString(<RiMapPinUserFill style={{ color: 'red', fontSize: '24px' }} />),
      className: 'custom-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <VStack spacing={8} width="100%" p={4}>
      <Heading as="h1" size="xl">
        Alertes SOS
      </Heading>
      {selectedEventId ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nom de l'équipe</Th>
              <Th>Créé à</Th>
              <Th>Enregistrement</Th>
              <Th>Carte</Th>
            </Tr>
          </Thead>
          <Tbody>
            {alerts.map((alert) => (
              <Tr key={alert.id}>
                <Td>{alert.team_name}</Td>
                <Td>{formatDate(alert.created_at)}</Td>
                <Td>
                  {alert.url ? (
                    <Button
                      colorScheme="blue"
                      onClick={() => openVideo(alert.url)}
                    >
                      Voir l'enregistrement
                    </Button>
                  ) : (
                    <Text color="gray.500" fontSize="sm">
                      Pas d'enregistrement
                    </Text>
                  )}
                </Td>
                <Td>
                  {alert.latitude && alert.longitude ? (
                    <Button
                      colorScheme="teal"
                      onClick={() => openMap(alert.latitude, alert.longitude)}
                    >
                      Voir la carte
                    </Button>
                  ) : (
                    <Text color="gray.500" fontSize="sm">
                      Pas de position connue
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>Sélectionnez un événement pour voir les alertes SOS associées</Text>
      )}

      <Modal isOpen={isVideoOpen} onClose={onVideoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enregistrement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUrl && (
              <Box width="100%">
                <video controls width="100%">
                  <source src={selectedUrl} type="video/webm" />
                  Votre navigateur ne supporte pas la balise vidéo.
                </video>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onVideoClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isMapOpen} onClose={onMapClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Carte</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLocation ? (
              <MapContainer
                center={[selectedLocation.latitude, selectedLocation.longitude]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
                />
                <Marker
                  position={[selectedLocation.latitude, selectedLocation.longitude]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    Localisation : {selectedLocation.latitude}, {selectedLocation.longitude}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <Text color="red.500">Coordonnées non valides. Impossible d’afficher la carte.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onMapClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default SOSAlertsView;
