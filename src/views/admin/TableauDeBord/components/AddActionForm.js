import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';

import { useEvent } from '../../../../EventContext';

import { supabase } from './../../../../supabaseClient';

const AddActionForm = () => {
  const { selectedEventId } = useEvent();
  const [teams, setTeams] = useState([]);
  const [action, setAction] = useState({
    teamId: '',
    actionName: '',
    startingDateTime: '',
    endingDateTime: '',
    comment: '',
  });
  const [alert, setAlert] = useState({
    status: '',
    message: '',
    isVisible: false,
  });

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedEventId) return; // Return if selectedEventId is not set
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('*')
        .eq('event_id', selectedEventId); // Filter teams by selectedEventId
      if (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
      } else {
        setTeams(data);
      }
    };

    fetchTeams();
  }, [selectedEventId]); // Make sure to include selectedEventId in the dependency array

  const handleStartingDateTimeChange = (e) => {
    const startingDateTime = e.target.value;
    const endDate = new Date(startingDateTime);
    endDate.setHours(endDate.getHours() + 1); // Add 1 hour
    const endingDateTime = endDate.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:mm'

    setAction({ ...action, startingDateTime, endingDateTime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAction = {
      event_id: selectedEventId,
      id: uuidv4(),
      team_to_which_its_attached: action.teamId,
      action_name: action.actionName,
      starting_date: action.startingDateTime,
      ending_date: action.endingDateTime,
      action_comment: action.comment,
    };

    const { error } = await supabase.from('vianney_actions').insert([newAction]);

    if (error) {
      console.error('Erreur lors de l insertion des données: ', error);
      setAlert({
        status: 'error',
        message: "Un problème est survenu lors de l'ajout de l'action.",
        isVisible: true,
      });
    } else {
      setAlert({
        status: 'success',
        message: "L'action a été ajoutée avec succès.",
        isVisible: true,
      });
      setAction({
        teamId: '',
        actionName: '',
        startingDateTime: '',
        endingDateTime: '',
        comment: '',
      });
    }
  };

  const closeAlert = () => {
    setAlert({ ...alert, isVisible: false });
  };
     
  return (
    <Box p={4}>
      {alert.isVisible && (
        <Alert status={alert.status} mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>{alert.status === 'error' ? 'Erreur!' : 'Succès!'}</AlertTitle>
            <AlertDescription display="block">{alert.message}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={closeAlert} />
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Équipe</FormLabel>
          <Select
            placeholder="Sélectionner une équipe"
            onChange={(e) => setAction({ ...action, teamId: e.target.value })}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name_of_the_team}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired mt={4}>
          <FormLabel>Nom de l'action</FormLabel>
          <Input
            placeholder="Nom de l'action"
            onChange={(e) => setAction({ ...action, actionName: e.target.value })}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Date de début</FormLabel>
          <Input
            type="datetime-local"
            onChange={handleStartingDateTimeChange}
            value={action.startingDateTime}
          />
        </FormControl>
        
        <FormControl mt={4}>
          <FormLabel>Date de fin</FormLabel>
          <Input
            type="datetime-local"
            onChange={(e) => setAction({ ...action, endingDateTime: e.target.value })}
            value={action.endingDateTime}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Commentaire</FormLabel>
          <Input
            placeholder="Commentaire"
            onChange={(e) => setAction({ ...action, comment: e.target.value })}
          />
        </FormControl>
        <Button mt={4} colorScheme="blue" type="submit">
          Ajouter l'action
        </Button>
      </form>
    </Box>
  );
};

export default AddActionForm;