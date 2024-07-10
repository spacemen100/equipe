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
} from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { FcExpand, FcCollapse, FcAdvance } from 'react-icons/fc';
import { useEvent } from './../../../EventContext';
import { useTeam } from './../../../views/admin/InterfaceEquipe/TeamContext';

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
            title: 'Alerte non résolue',
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
  }, [teamUUID]);

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
    // Check if an event is selected every 30 seconds
    const intervalId = setInterval(() => {
      if (!isEventSelected) {
        // Reload the page if no event is selected
        window.location.reload();
      }
    }, 30000); // 30 seconds in milliseconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [isEventSelected]);

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
        <Alert status="warning" mt={2}>
          <AlertIcon />
          Une alerte non résolue a été trouvée pour votre équipe.
        </Alert>
      )}
    </Box>
  );
};

export default DropdownMenu;
