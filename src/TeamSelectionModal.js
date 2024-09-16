import React, { useState } from 'react';
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
  const [eventName, setEventName] = useState(''); // Manually input event name
  const [teamName, setTeamName] = useState(''); // Manually input team name
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleTeamSelected = async () => {
    try {
      setLoading(true);

      // Fetch event by the entered event name
      const { data: eventData, error: eventError } = await supabase
        .from('vianney_event')
        .select('event_id')
        .eq('event_name', eventName)
        .single(); // Ensuring there is only one event with the name

      if (eventError || !eventData) {
        throw new Error('Événement introuvable');
      }

      const eventId = eventData.event_id; // Extract event_id from the query

      // Fetch team by the entered team name and event ID
      const { data: teamData, error: teamError } = await supabase
        .from('vianney_teams')
        .select('id, team_members, password')
        .eq('name_of_the_team', teamName)
        .eq('event_id', eventId)
        .single(); // Ensuring the team belongs to the selected event

      if (teamError || !teamData) {
        throw new Error('Équipe introuvable');
      }

      // Check if the password matches
      if (teamData.password !== password) {
        throw new Error('Mot de passe incorrect');
      }

      // If all validations pass, update contexts and proceed
      setEventId(eventId); // Set event context with event_id
      setSelectedTeam(teamName); // Set team context with team name
      setTeamUUID(teamData.id); // Set team UUID
      setTeamMembers(teamData.team_members); // Set team members

      toast({
        title: 'Succès',
        description: 'Équipe sélectionnée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close modal after success
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error:', error.message);
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
      <ModalContent
        width="100vw"
        height="100vh"
        maxWidth="100vw"
        maxHeight="100vh"
        bgGradient="linear(to-r, #1A202C, #2D3748)" // Dark gradient background
        color="white" // White text
      >
        {/* Centering the header text and adding the logo */}
        <ModalHeader display="flex" alignItems="center" justifyContent="center" textAlign="center">
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
          <Flex direction="column" align="center" justify="center" height="100%" position="relative" zIndex={10}>
            <Box width="100%" maxWidth="400px" position="relative">
              {/* Event Input */}
              <FormControl>
                <FormLabel>Nom de l'événement</FormLabel>
                <Input
                  type="text"
                  placeholder="Saisissez le nom de l'événement"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  bg="gray.700" // Dark input background
                  color="white" // White input text
                  _placeholder={{ color: 'gray.300' }} // Lighter placeholder text
                />
              </FormControl>

              {/* Team Input */}
              <FormControl mt={4}>
                <FormLabel>Nom de l'équipe</FormLabel>
                <Input
                  type="text"
                  placeholder="Saisissez le nom de l'équipe"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  isDisabled={!eventName} // Disable if no event name entered
                  bg="gray.700" // Dark input background
                  color="white" // White input text
                  _placeholder={{ color: 'gray.300' }} // Lighter placeholder text
                />
              </FormControl>

              {/* Password Input */}
              <FormControl mt={4}>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDisabled={!teamName} // Disable until team is selected
                  bg="gray.700" // Dark input background
                  color="white" // White input text
                  _placeholder={{ color: 'gray.300' }} // Lighter placeholder text
                />
              </FormControl>

              {/* Submit Button */}
              <Button
                mt={4}
                width="100%"
                onClick={handleTeamSelected}
                disabled={loading || !eventName || !teamName || !password} // Disable if any input is missing
                bg="orange.400"
                color="white"
                _hover={{ bg: 'orange.500' }}
              >
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
