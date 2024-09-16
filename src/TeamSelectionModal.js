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
  useDisclosure,
  Flex,
  Box,
  Image,
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
  const [eventName, setEventName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Automatically populate fields with saved data from localStorage
  useEffect(() => {
    const savedEvent = localStorage.getItem('eventName');
    const savedTeam = localStorage.getItem('teamName');
    const savedPassword = localStorage.getItem('password');
    if (savedEvent && savedTeam && savedPassword) {
      setEventName(savedEvent);
      setTeamName(savedTeam);
      setPassword(savedPassword);
    }
  }, []);

  const handleTeamSelected = async () => {
    try {
      setLoading(true);

      // Fetch event by the entered event name
      const { data: eventData, error: eventError } = await supabase
        .from('vianney_event')
        .select('event_id')
        .eq('event_name', eventName)
        .single();

      if (eventError || !eventData) {
        throw new Error('Événement introuvable');
      }

      const eventId = eventData.event_id;

      // Fetch team by the entered team name and event ID
      const { data: teamData, error: teamError } = await supabase
        .from('vianney_teams')
        .select('id, team_members, password')
        .eq('name_of_the_team', teamName)
        .eq('event_id', eventId)
        .single();

      if (teamError || !teamData) {
        throw new Error('Équipe introuvable');
      }

      // Check if the password matches
      if (teamData.password !== password) {
        throw new Error('Mot de passe incorrect');
      }

      // Save credentials to localStorage
      localStorage.setItem('eventName', eventName);
      localStorage.setItem('teamName', teamName);
      localStorage.setItem('password', password);

      // If all validations pass, update contexts and proceed
      setEventId(eventId);
      setSelectedTeam(teamName);
      setTeamUUID(teamData.id);
      setTeamMembers(teamData.team_members);

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
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la sélection de l\'équipe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white"> {/* Dark background and white text */}
        <ModalHeader display="flex" justifyContent="center" textAlign="center">
          <Box
            borderRadius="full"
            overflow="hidden"
            width="50px"
            height="50px"
            marginRight="10px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image src="/logo512.png" alt="Logo" width="100%" height="100%" />
          </Box>
          Connexion
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" align="center" justify="center" height="100%">
            <Box width="100%" maxWidth="400px">
              <FormControl>
                <FormLabel>Nom de l'événement</FormLabel>
                <Input
                  type="text"
                  placeholder="Saisissez le nom de l'événement"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Nom de l'équipe</FormLabel>
                <Input
                  type="text"
                  placeholder="Saisissez le nom de l'équipe"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  isDisabled={!eventName}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDisabled={!teamName}
                />
              </FormControl>

              <Button
                mt={4}
                width="100%"
                onClick={handleTeamSelected}
                disabled={loading || !eventName || !teamName || !password}
              >
                {loading ? <Spinner size="sm" mr={2} /> : 'Se Connecter'}
              </Button>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TeamSelectionModal;
