import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Tooltip,
  useBreakpointValue,
  useColorModeValue, // Add this import
} from '@chakra-ui/react';
import { FcPhone } from "react-icons/fc";
import { useEvent } from '../../../../EventContext';
import { useTeam } from './../../InterfaceEquipe/TeamContext';
import { supabase } from './../../../../supabaseClient';
import EditUserForm from './EditUserForm';

const EquipiersTableSimplify = () => {
  const [equipiers, setEquipiers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipier, setSelectedEquipier] = useState(null);
  const [filterEnabled, setFilterEnabled] = useState(true);
  const { selectedEventId } = useEvent();
  const { selectedTeam } = useTeam();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const onRowClick = (equipier) => {
    setSelectedEquipier(equipier);
    setIsModalOpen(true);
  };

  const avatarStyle = {
    border: '2px solid',
    borderColor: useColorModeValue('gray.300', 'gray.500'), // Now this will work
  };

  useEffect(() => {
    const fetchEquipiers = async () => {
      try {
        let query = supabase
          .from('vianney_teams')
          .select(`
            *,
            vianney_actions (
              id,
              action_name,
              starting_date,
              ending_date,
              action_comment,
              last_updated
            ),
            vianney_inventaire_materiel (
              id,
              nom,
              description,
              couleur
            )
          `)
          .order('name_of_the_team', { ascending: true });

        if (selectedEventId) {
          query = query.eq('event_id', selectedEventId);
        }

        let { data: teams, error } = await query;

        if (error) {
          console.error('Error fetching equipiers:', error);
          return;
        }

        setEquipiers(teams);
      } catch (error) {
        console.error('Error fetching equipiers:', error);
      }
    };

    fetchEquipiers();
  }, [selectedEventId]);

  const getLeaderNameAndPhone = (teamMembers) => {
    const leader = teamMembers.find(member => member.isLeader);
    if (!leader) {
      return 'No Leader';
    }
    return (
      <Flex align="center">
        <Text color="blue.500" mr={1}>
          {leader.firstname}
        </Text>
        <Text fontWeight="bold" color="blue.900" mr={2}>
          {leader.familyname}
        </Text>
        {leader.phone && (
          <Flex align="center">
            <FcPhone />
            <Text as="span" fontWeight="bold" ml={1}>
              {leader.phone}
            </Text>
          </Flex>
        )}
      </Flex>
    );
  };

  const filteredEquipiers = filterEnabled && selectedTeam
    ? equipiers.filter(equipier => equipier.name_of_the_team === selectedTeam)
    : equipiers;

  return (
    <>
      <Box>
        {filteredEquipiers.map((equipier, index) => (
          <Tooltip label="Cliquez pour ouvrir l'onglet de modification" key={index}>
            <Box
              onClick={() => onRowClick(equipier)}
              p={4}
              mb={4}
              borderRadius="md"
              boxShadow="md"
              cursor="pointer"
              _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
            >
              <Flex align="center">
                <Avatar size="md" src={equipier.photo_profile_url} style={avatarStyle} />
                <Box ml={4}>
                  <Text fontWeight="bold">{equipier.name_of_the_team}</Text>
                  <Text fontSize="sm" color="gray.500">{getLeaderNameAndPhone(equipier.team_members)}</Text>
                  {!isMobile && <Text fontSize="sm">{equipier.mission}</Text>}
                </Box>
              </Flex>
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box mt={4}>
        {selectedTeam && (
          <Button onClick={() => setFilterEnabled(!filterEnabled)}>
            {filterEnabled ? "Afficher toutes les équipes de l'évênement" : `Filtrer par l'équipe: ${selectedTeam}`}
          </Button>
        )}
      </Box>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <EditUserForm
              teamData={selectedEquipier}
              onSave={(updatedTeam) => {
                // Handle save logic here
                setIsModalOpen(false);
              }}
              onDelete={() => {
                // Handle delete logic here
                setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EquipiersTableSimplify;