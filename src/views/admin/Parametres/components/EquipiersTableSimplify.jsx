import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  Text,
  Button,
  Box,
} from '@chakra-ui/react';
import { FcPhone } from "react-icons/fc";
import 'leaflet/dist/leaflet.css';

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

  const onRowClick = (equipier) => {
    setSelectedEquipier(equipier);
    setIsModalOpen(true);
  };

  const headerStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: useColorModeValue('gray.600', 'gray.200'),
  };

  const headerGradientStyle = {
    background: 'linear-gradient(to right, #ff914d, #ff7730)',
    color: 'white',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
    zIndex: 1
  };

  const tableRowStyle = {
    borderBottom: '1px solid',
    borderBottomColor: useColorModeValue('gray.200', 'gray.600'),
  };

  const avatarStyle = {
    border: '2px solid',
    borderColor: useColorModeValue('gray.300', 'gray.500'),
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

        // Filter by event_id if selectedEventId is available
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
      
      <TableContainer style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <Table variant='simple'>
          <Thead style={{ ...headerGradientStyle, position: 'sticky', top: 0, zIndex: 1 }}>
            <Tr>
              <Th><Text style={headerStyle}>Photo</Text></Th>
              <Th><Text style={headerStyle}>Nom de l'équipe</Text></Th>
              <Th><Text style={headerStyle}>Nom du responsable</Text></Th>
              <Th><Text style={headerStyle}>Mission</Text></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEquipiers.map((equipier, index) => (
              <Tr key={index} onClick={() => onRowClick(equipier)} style={{ ...tableRowStyle, cursor: 'pointer' }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                <Td><Avatar size="md" src={equipier.photo_profile_url} style={avatarStyle} /></Td>
                <Td>{equipier.name_of_the_team}</Td>
                <Td>{getLeaderNameAndPhone(equipier.team_members)}</Td>
                <Td>{equipier.mission}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
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
