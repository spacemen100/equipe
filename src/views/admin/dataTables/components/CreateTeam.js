import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Alert, AlertIcon,
} from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [teamCharacteristics, setTeamCharacteristics] = useState('');
  const [alertStatus, setAlertStatus] = useState(''); // 'success' or 'error'
  const [alertMessage, setAlertMessage] = useState('');
  const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    return `#${randomColor}`;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const teamColor = generateRandomColor(); // Generate a random color for the team
    const timestamp = new Date().toISOString(); // Generate a timestamp
  
    try {
      const { error } = await supabase
        .from('vianney_teams')
        .upsert([
          {
            id: uuidv4(),
            creation_timestamp: timestamp, // Include the timestamp here
            name_of_the_team: teamName,
            persons_working_in_team: teamMembers.split(',').map((member) => member.trim()),
            characteristics_of_the_team: teamCharacteristics.split(',').map((char) => char.trim()),
            color: teamColor,
          },
        ]);
  
      if (error) {
        setAlertStatus('error');
        setAlertMessage('Erreur lors de la création de l\'équipe. Veuillez réessayer.');
        console.log(alertMessage); 
      } else {
        setAlertStatus('success');
        setAlertMessage('Équipe créée avec succès.');
        setTeamName('');
        setTeamMembers('');
        setTeamCharacteristics('');
      }
    } catch (error) {
      console.error('Erreur de connexion à Supabase :', error);
      setAlertStatus('error');
      setAlertMessage('Erreur de connexion à Supabase. Veuillez réessayer.');
    }
  };
  

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="teamName">
            <FormLabel>Nom de l'équipe</FormLabel>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </FormControl>
          <FormControl id="teamMembers">
            <FormLabel>Membres de l'équipe</FormLabel>
            <Input
              type="text"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              required
            />
          </FormControl>
          <FormControl id="teamCharacteristics">
            <FormLabel>Caractéristiques de l'équipe</FormLabel>
            <Textarea
              value={teamCharacteristics}
              onChange={(e) => setTeamCharacteristics(e.target.value)}
              rows={4}
            />
          </FormControl>
          <Button type="submit" colorScheme="teal">
            Créer l'équipe
          </Button>
          {alertStatus && (
            <Alert status={alertStatus}>
              <AlertIcon />
              {alertStatus === 'success' ? 'Équipe créée avec succès.' : 'Erreur lors de la création de l\'équipe. Veuillez réessayer.'}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
}

export default CreateTeam;
