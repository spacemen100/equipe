import React, { useState, useEffect } from 'react';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure
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
import { useEvent } from './../../../../EventContext'; // Import the useEvent hook
import ReactDOMServer from 'react-dom/server'; // Import ReactDOMServer

const SOSAlertsView = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null); // Store the selected location
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control for map
  const { selectedEventId } = useEvent(); // Get the selected event ID from the context

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
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts(data);
    }
  };

  const openMap = (latitude, longitude) => {
    setSelectedLocation({ latitude, longitude });
    onOpen();
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

  return (
    <VStack spacing={8} width="100%" p={4}>
      <Heading as="h1" size="xl">
        SOS Alerts
      </Heading>
      {selectedEventId ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Team Name</Th>
              <Th>Latitude</Th>
              <Th>Longitude</Th>
              <Th>Created At</Th>
              <Th>Recording</Th>
              <Th>Map</Th>
            </Tr>
          </Thead>
          <Tbody>
            {alerts.map((alert) => (
              <Tr key={alert.id}>
                <Td>{alert.team_name}</Td>
                <Td>{alert.latitude}</Td>
                <Td>{alert.longitude}</Td>
                <Td>{new Date(alert.created_at).toLocaleString()}</Td>
                <Td>
                  {alert.url ? (
                    <Button
                      colorScheme="blue"
                      onClick={() => setSelectedUrl(alert.url)}
                    >
                      View Recording
                    </Button>
                  ) : (
                    'No Recording'
                  )}
                </Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    onClick={() => openMap(alert.latitude, alert.longitude)}
                  >
                    View Map
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>Select an event to view related SOS alerts</Text>
      )}
      {selectedUrl && (
        <Box width="100%">
          <Heading as="h2" size="lg" mt={8} mb={4}>
            Recording
          </Heading>
          <video controls width="100%">
            <source src={selectedUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <Button mt={4} onClick={() => setSelectedUrl('')}>
            Close
          </Button>
        </Box>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Map</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLocation && (
              <MapContainer
                center={[selectedLocation.latitude, selectedLocation.longitude]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                  position={[selectedLocation.latitude, selectedLocation.longitude]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    Location: {selectedLocation.latitude}, {selectedLocation.longitude}
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default SOSAlertsView;
