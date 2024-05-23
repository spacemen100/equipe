import React, { useEffect, useState } from 'react';
import { useTeam } from './TeamContext';
import { useEvent } from '../../../EventContext'; // Import useEvent context
import {
  Box,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Button,
  CloseButton,
  Spacer,
  Text,
} from '@chakra-ui/react';
import GpsPosition from './components/GpsPosition';
import VianneyAlertChat from '../TableauDeBord/components/VianneyAlertChat';
import { supabase } from './../../../supabaseClient';
import TeamMembersDisplay from './components/TeamMembersDisplay';

import UrgentAlerts from './components/UrgentAlerts';
import TeamScheduleByMySelfEquipe from '../TableauDeBord/components/TeamScheduleMadeMySelfEquipe';
import DocumentsViewer from './components/DocumentsViewer';

const InterfaceEquipe = () => {
  const { teamMembers, selectedTeam, setSelectedTeam, teamData, setTeamData } = useTeam();
  const { selectedEventId } = useEvent(); // Get selected event ID from useEvent context
  const leaders = teamMembers.filter(member => member.isLeader);
  const [showAlert, setShowAlert] = useState(!selectedTeam);
  const [showDropdown, setShowDropdown] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const toggleAppVisibility = () => {
    setShowApp(!showApp);
  };

  useEffect(() => {
    async function fetchTeamData() {
      try {
        let query = supabase.from('vianney_teams').select('id, name_of_the_team');

        // If selectedEventId is available, filter teams by event_id
        if (selectedEventId) {
          query = query.eq('event_id', selectedEventId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        setTeamData(data);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    }

    fetchTeamData();
  }, [selectedEventId, setTeamData]);

  const handleTeamSelection = (event) => {
    setSelectedTeam(event.target.value);
    setShowAlert(false);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Box pt={{ base: '180px', md: '80px', xl: '80px' }}>
      <UrgentAlerts />
      {showAlert && (
        <Alert status="error" mb="4" minHeight="100px">
          <AlertIcon />
          <AlertTitle>Attention!</AlertTitle>
          <AlertDescription>
            Sélectionnez une équipe est obligatoire
          </AlertDescription>
          <CloseButton onClick={() => setShowAlert(false)} position="absolute" right="8px" top="8px" />
        </Alert>
      )}
      {showDropdown ? (
        <>
          <Select
            value={selectedTeam}
            onChange={handleTeamSelection}
            placeholder="Selectionnez une équipe"
          >
            {teamData.map((team) => (
              <option key={team.id} value={team.name_of_the_team}>
                {team.name_of_the_team}
              </option>
            ))}
          </Select>
        </>
      ) : (
        <Button onClick={toggleDropdown} size="sm" fontSize="sm">
          Afficher le menu déroulant
        </Button>
      )}
      <Spacer />
      {selectedTeam && (
        <Badge colorScheme="green" mb="2">
          L'équipe que vous avez sélectionnée est : {selectedTeam} avec le chef d'équipe : {leaders.map((leader, index) => (
            <Box key={index}>
              <Text fontWeight="bold">{leader.firstname} {leader.familyname}</Text>
            </Box>
          ))}
        </Badge>
      )}
      <TeamMembersDisplay />
      <GpsPosition />
      <DocumentsViewer/>
      <VianneyAlertChat />
      <TeamScheduleByMySelfEquipe />
      <Badge colorScheme="orange" onClick={toggleAppVisibility} cursor="pointer" mt={1}>
        {showApp ? "Cacher" : "Montrer"} Radio CB virtuelle
      </Badge>
      {showApp && (
        <div>

        </div>
      )}
    </Box>
  );
};

export default InterfaceEquipe;