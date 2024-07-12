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
  Spinner
} from '@chakra-ui/react';
import { useTeam } from './views/admin/InterfaceEquipe/TeamContext';
import { useEvent } from './EventContext';
import { supabase } from './supabaseClient';

const TeamSelectionModal = () => {
  const { setSelectedTeam, setTeamUUID, setTeamMembers } = useTeam();
  const { setEventId } = useEvent();
  // eslint-disable-next-line
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [teamSelected, setTeamSelected] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false); // Nouvel état pour gérer la visibilité du spinner
  const toast = useToast();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_teams')
          .select('name_of_the_team');

        if (error) {
          throw error;
        }

        setTeamData(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamSelected = async () => {
    try {
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('id, event_id, team_members, password')
        .eq('name_of_the_team', teamName)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        if (data.password === password) {
          setEventId(data.event_id); // Mettre à jour le EventContext avec l'event_id
          setSelectedTeam(teamName); // Mettre à jour le TeamContext avec le nom de l'équipe
          setTeamUUID(data.id); // Mettre à jour le TeamContext avec l'UUID de l'équipe
          setTeamMembers(data.team_members); // Mettre à jour les membres de l'équipe
          setTeamSelected(true);
          setLoading(true); // Afficher le spinner
        } else {
          toast({
            title: 'Erreur',
            description: 'Mot de passe incorrect',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
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

  useEffect(() => {
    if (teamSelected) {
      const timer = setTimeout(() => {
        setLoading(false); // Cacher le spinner
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [teamSelected, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay />
      <ModalContent width="100vw" height="100vh" maxWidth="100vw" maxHeight="100vh">
        <ModalHeader>Selectionnez votre équipe</ModalHeader>
        <ModalBody>
          <Flex
            direction="column"
            align="center"
            justify="center"
            height="100%"
            position="relative"
            zIndex={10}
          >
            <Box width="100%" maxWidth="400px" position="relative">
              <FormControl>
                <FormLabel>Nom de l'équipe</FormLabel>
                <Select
                  placeholder="Selectionnez une équipe"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                >
                  {teamData.map((team) => (
                    <option key={team.name_of_the_team} value={team.name_of_the_team}>
                      {team.name_of_the_team}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Mot de passe (123)</FormLabel>
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button mt={4} width="100%" onClick={handleTeamSelected} disabled={loading}>
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
