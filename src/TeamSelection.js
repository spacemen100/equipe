import React, { useEffect, useState } from 'react';
import {
  Box,
  Select,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react';
import { supabase } from './supabaseClient';

const TeamSelection = ({ onTeamSelected }) => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [teamData, setTeamData] = useState([]);
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

  const handleSubmit = () => {
    if (!teamName || !password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer le nom de l\'équipe et le mot de passe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    onTeamSelected(teamName, password);
  };

  return (
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
      <FormControl mt={4} position="relative" zIndex={10}>
        <FormLabel>Mot de passe</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <Button mt={4} width="100%" onClick={handleSubmit}>
        Se Connecter
      </Button>
    </Box>
  );
};

export default TeamSelection;
