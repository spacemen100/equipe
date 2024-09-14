import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Flex,
  Box,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useTeam } from './views/admin/InterfaceEquipe/TeamContext';
import { useEvent } from './EventContext';
import { supabase } from './supabaseClient';

const TeamSelectionModal = () => {
  const { setSelectedTeam, setTeamUUID, setTeamMembers } = useTeam();
  const { setEventId } = useEvent();
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(''); // Holds the event_id (UUID)
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch available events when the modal is opened
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_event') // Correct table name
          .select('event_id, event_name'); // Select event_id (UUID) and event_name

        if (error) throw error;
        if (data) setEvents(data); // Set events to the response data
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Erreur',
          description: 'Erreur lors de la récupération des événements',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchEvents();
  }, [toast]);

  // Fetch teams based on selected event (using event_id)
  useEffect(() => {
    if (selectedEvent) {
      const fetchTeams = async () => {
        try {
          const { data, error } = await supabase
            .from('vianney_teams')
            .select('name_of_the_team')
            .eq('event_id', selectedEvent); // Use event_id (UUID) instead of event name

          if (error) throw error;
          if (data) setTeams(data); // Set teams based on selected event
        } catch (error) {
          console.error('Error fetching teams:', error);
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la récupération des équipes',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };

      fetchTeams();
    }
  }, [selectedEvent, toast]);

  const handleTeamSelected = async () => {
    try {
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('id, event_id, team_members, password')
        .eq('name_of_the_team', teamName)
        .eq('event_id', selectedEvent) // Use event_id (UUID)
        .single();

      if (error) throw error;

      if (data && data.password === password) {
        setEventId(data.event_id); // Set event context with event_id
        setSelectedTeam(teamName); // Set team context with team name
        setTeamUUID(data.id); // Set team UUID
        setTeamMembers(data.team_members); // Set team members
        setLoading(true); // Show spinner
        toast({
          title: 'Succès',
          description: 'Équipe sélectionnée avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 1000);
      } else {
        toast({
          title: 'Erreur',
          description: 'Mot de passe incorrect',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la récupération des données de l\'équipe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay />
      <ModalContent width="100vw" height="100vh" maxWidth="100vw" maxHeight="100vh">
        <ModalHeader>Selectionnez un événement et une équipe</ModalHeader>
        <ModalBody>
          <Flex direction="column" align="center" justify="center" height="100%" position="relative" zIndex={10}>
            <Box width="100%" maxWidth="400px" position="relative">
              {/* Event Selection */}
              <FormControl>
                <FormLabel>Événement</FormLabel>
                <Select
                  placeholder="Selectionnez un événement"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)} // This sets event_id (UUID)
                >
                  {events.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.event_name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Team Selection */}
              <FormControl mt={4}>
                <FormLabel>Nom de l'équipe</FormLabel>
                <Select
                  placeholder="Selectionnez une équipe"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  isDisabled={!selectedEvent} // Disable until event is selected
                >
                  {teams.map((team) => (
                    <option key={team.name_of_the_team} value={team.name_of_the_team}>
                      {team.name_of_the_team}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Password Input */}
              <FormControl mt={4}>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDisabled={!teamName} // Disable until team is selected
                />
              </FormControl>

              {/* Submit Button */}
              <Button mt={4} width="100%" onClick={handleTeamSelected} disabled={loading || !password}>
                {loading ? <Spinner size="sm" mr={2} /> : null}
                Se Connecter
              </Button>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TeamSelectionModal;
