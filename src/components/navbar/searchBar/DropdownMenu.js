// src/DropdownMenu.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
  Badge,
  HStack,
  ModalCloseButton,
} from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { FcExpand, FcCollapse, FcAdvance } from 'react-icons/fc';
import { useEvent } from './../../../EventContext';
import { useTeam } from './../../../views/admin/InterfaceEquipe/TeamContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { RiMapPinUserFill } from 'react-icons/ri';
import { MdOutlineAccessTime, MdSos } from 'react-icons/md';
import { FaUserShield } from 'react-icons/fa';

const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DropdownMenu = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [eventList, setEventList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEventSelected, setIsEventSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [alertData, setAlertData] = useState(null);

  const { setEventId, selectedEventId } = useEvent();
       // eslint-disable-next-line
  const { selectedTeam, teamUUID } = useTeam();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('vianney_event').select('*');
        if (error) {
          throw error;
        }
        setEventList(data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!teamUUID) return; // Don't fetch if no team is selected

      try {
        const { data, error } = await supabase
          .from('vianney_sos_alerts')
          .select('*')
          .or('resolved.is.false,resolved.is.null')
          .eq('team_id', teamUUID); // Fetch alerts for the selected team

        if (error) {
          throw error;
        }

        if (data.length > 0) {
          setAlertData(data[0]); // Show the first unresolved alert for the team
          toast({
            title: 'Alerte non résolue: Merci de vous rendre au lieu indiqué ',
            description: 'Une alerte non résolue a été trouvée pour votre équipe.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error fetching alerts:', error.message);
      }
    };

    fetchAlerts(); // Initial fetch

    // Check for unresolved alerts every 60 seconds
    const intervalId = setInterval(fetchAlerts, 60000); // 60 seconds in milliseconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [teamUUID, toast]);

  const handleSelect = (event) => {
    setSelectedItem(event.event_name);
    setEventId(event.event_id);
    setIsEventSelected(true);
    setIsModalOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Check if a team is selected every 30 seconds
    const intervalId = setInterval(async () => {
      if (teamUUID && !isEventSelected) {
        try {
          const { data, error } = await supabase
            .from('vianney_teams')
            .select('event_id')
            .eq('id', teamUUID)
            .single();

          if (error) {
            throw error;
          }

          if (data && data.event_id) {
            const event = eventList.find((e) => e.event_id === data.event_id);
            if (event) {
              handleSelect(event);
            }
          }
        } catch (error) {
          console.error('Error fetching event for team:', error.message);
        }
      }
    }, 10000); // 10 seconds in milliseconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [teamUUID, isEventSelected, eventList]);

  const createCustomIcon = () => {
    return L.divIcon({
      html: ReactDOMServer.renderToString(<RiMapPinUserFill style={{ color: 'red', fontSize: '24px' }} />),
      className: 'custom-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Box>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={isOpen ? <FcCollapse /> : <FcExpand />}
          onClick={toggleMenu}
        >
          {selectedItem || 'Choisissez l\'événement'}
          {selectedEventId && <Text ml={2}> </Text>}
        </MenuButton>
        <MenuList>
          {eventList.map((event) => (
            <MenuItem
              key={event.event_id}
              onClick={() => handleSelect(event)}
            >
              {event.event_name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      {!isEventSelected && (
        <Alert status="warning" mt={2}>
          <AlertIcon />
          Merci de sélectionner un évênement.
        </Alert>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sélectionnez un évênement</ModalHeader>
          <ModalBody>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              Veuillez sélectionner un événement pour continuer.&nbsp;   <FcAdvance />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {alertData && (
        <Modal isOpen={true} onClose={() => setAlertData(null)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Badge colorScheme="red" px={4} py={2} borderRadius="md">
                <HStack spacing={2}>
                  <MdSos />
                  <Text>Alerte non résolue : Merci de vous rendre au lieu indiqué pour un soutient</Text>
                </HStack>
              </Badge>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack spacing={4}>
                <FaUserShield />
                <Badge colorScheme="blue">{alertData.team_name}</Badge>
              </HStack>
              <HStack spacing={4} mt={4}>
                <MdOutlineAccessTime />
                <Badge colorScheme="green">{formatDateTime(alertData.created_at)}</Badge>
              </HStack>
              {alertData.url && (
                <Box mt={4}>
                  <video controls width="100%">
                    <source src={alertData.url} type="video/webm" />
                    Votre navigateur ne supporte pas la balise vidéo.
                  </video>
                </Box>
              )}
              {alertData.latitude && alertData.longitude && (
                <Box mt={4}>
                  <MapContainer
                    center={[alertData.latitude, alertData.longitude]}
                    zoom={13}
                    style={{ height: '300px', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
                    />
                    <Marker
                      position={[alertData.latitude, alertData.longitude]}
                      icon={createCustomIcon()}
                    >
                      <Popup>
                        Localisation de l'alerte
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setAlertData(null)}>
                Fermer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default DropdownMenu;
