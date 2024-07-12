// src/TeamSelectionModal.js
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import TeamSelection from './TeamSelection';
import { useTeam } from './views/admin/InterfaceEquipe/TeamContext';
import { useEvent } from './EventContext';
import { supabase } from './supabaseClient';

const TeamSelectionModal = () => {
  const { setSelectedTeam, setTeamUUID, setTeamMembers } = useTeam();
  const { setEventId } = useEvent();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [teamSelected, setTeamSelected] = useState(false);

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const handleTeamSelected = async (teamName) => {
    try {
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('id, event_id, team_members')
        .eq('name_of_the_team', teamName)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setEventId(data.event_id); // Mettre à jour le EventContext avec l'event_id
        setSelectedTeam(teamName); // Mettre à jour le TeamContext avec le nom de l'équipe
        setTeamUUID(data.id); // Mettre à jour le TeamContext avec l'UUID de l'équipe
        setTeamMembers(data.team_members); // Mettre à jour les membres de l'équipe
        setTeamSelected(true);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  useEffect(() => {
    if (teamSelected) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [teamSelected, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Selectionnez votre équipe</DrawerHeader>
        <DrawerBody>
          <Flex
            direction="column"
            align="center"
            justify="center"
            height="100%"
          >
            <TeamSelection onTeamSelected={handleTeamSelected} />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default TeamSelectionModal;
