import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import {
  ModalCloseButton, Box, Text, SimpleGrid, VStack, Badge, Alert, AlertIcon, IconButton, Tooltip, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useToast, HStack,
  Select, Input, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import { MdDeleteForever } from "react-icons/md";
import { FcDisclaimer, FcOk } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import { useEvent } from '../../../../EventContext';
import { useTeam } from './../../InterfaceEquipe/TeamContext';  // Import useTeam context

const AfficherMateriels = () => {
  const [materiels, setMateriels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
    // eslint-disable-next-line no-unused-vars
  const [events, setEvents] = useState([]);
    // eslint-disable-next-line no-unused-vars
  const [selectedEvent, setSelectedEvent] = useState('');
    // eslint-disable-next-line no-unused-vars
  const [loadingEvents, setLoadingEvents] = useState(true);
    // eslint-disable-next-line no-unused-vars
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { isOpen: isAssociationModalOpen, onOpen: onAssociationModalOpen, onClose: onAssociationModalClose } = useDisclosure();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const { selectedEventId } = useEvent();
  const [selectedEventName, setSelectedEventName] = useState('');
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
        // eslint-disable-next-line no-unused-vars
  const [filteredTeams, setFilteredTeams] = useState([]);
  const { selectedTeam: selectedTeamContext, setSelectedTeam: setTeamContext } = useTeam();  // Get the selected team from useTeam context

  const filteredMateriels = materiels.filter(materiel => {
    if (teamSearchTerm === '') return true;
    const team = teams.find(team => team.id === materiel.associated_team_id);
    return team ? team.name_of_the_team.toLowerCase().includes(teamSearchTerm.toLowerCase()) : false;
  }).filter((materiel) => {
    const searchTermLower = searchTerm.toLowerCase();
    return materiel.nom.toLowerCase().includes(searchTermLower) ||
      (materiel.description && materiel.description.toLowerCase().includes(searchTermLower));
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('vianney_event')
        .select('*');
      if (error) {
        console.error('Erreur lors de la récupération des événements', error);
      } else {
        setEvents(data);
        const currentEvent = data.find(event => event.event_id === selectedEventId);
        if (currentEvent) setSelectedEventName(currentEvent.event_name);
      }
      setLoadingEvents(false);
    };

    fetchEvents();
  }, [selectedEventId, setLoadingEvents, setEvents]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedEventId) return;
      setLoadingTeams(true);
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('*')
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Erreur lors de la récupération des équipes', error);
        setTeams([]);
      } else {
        setTeams(data);
      }
      setLoadingTeams(false);
    };

    fetchTeams();
  }, [selectedEventId]);

  const eventDisplay = selectedEventName ? (
    <Badge colorScheme="blue" p="2">
      {selectedEventName} (Sélectionné)
    </Badge>
  ) : (
    <Text>Chargement de l'événement...</Text>
  );

  useEffect(() => {
    const chargerMateriels = async () => {
      const { data: materielsData, error: materielsError } = await supabase.from('vianney_inventaire_materiel').select('*');
      if (materielsError) {
        console.error('Erreur lors de la récupération des matériels', materielsError);
      } else {
        const { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('*');
        if (teamsError) {
          console.error('Erreur lors de la récupération des équipes', teamsError);
        } else {
          const updatedMateriels = materielsData.map(materiel => {
            const associatedTeam = teamsData.find(team => team.id === materiel.associated_team_id);
            return {
              ...materiel,
              associated_team_name: associatedTeam ? associatedTeam.name_of_the_team : 'Aucune équipe associée'
            };
          });
          setMateriels(updatedMateriels);
        }
      }
      setLoading(false);
    };

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('vianney_event')
        .select('*');
      if (error) console.error('Erreur lors de la récupération des événements', error);
      else setEvents(data);
      setLoadingEvents(false);
    };

    const fetchMateriels = async () => {
      const { data, error } = await supabase.from('vianney_inventaire_materiel').select('*');
      if (error) {
        console.error('Erreur lors de la récupération des matériels', error);
      } else {
        setMateriels(data);
      }
      setLoadingMateriels(false);
    };

    chargerMateriels();
    fetchEvents();
    fetchMateriels();
  }, [selectedEvent, setEvents, setLoadingEvents, setLoadingMateriels]);

  useEffect(() => {
    if (selectedTeamContext) {
      setTeamSearchTerm(selectedTeamContext);  // Synchronize the input field with the selected team from context
    }
  }, [selectedTeamContext]);

  const handleOpenAssociationModal = (materiel) => {
    setSelectedMaterial(materiel);
    onAssociationModalOpen();
  };

  const handleDeleteConfirmation = (id) => {
    setConfirmDeleteId(id);
    onOpen();
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      const { error } = await supabase.from('vianney_inventaire_materiel').delete().match({ id: confirmDeleteId });
      if (error) {
        console.error('Erreur lors de la suppression du matériel', error);
      } else {
        setMateriels(materiels.filter(materiel => materiel.id !== confirmDeleteId));
        onClose();
        setConfirmDeleteId(null);
        toast({
          title: "Matériel supprimé avec succès",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleReturnMaterial = async (id) => {
    const updatedMateriels = materiels.map(materiel => {
      if (materiel.id === id) {
        return { ...materiel, associated_team_id: null, associated_team_name: 'Aucune équipe associée' };
      }
      return materiel;
    });
    setMateriels(updatedMateriels);

    const { error } = await supabase.from('vianney_inventaire_materiel').update({ associated_team_id: null }).match({ id });
    if (error) {
      console.error('Erreur lors de la mise à jour du matériel', error);
    } else {
      toast({
        title: "Matériel rendu avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    const team = teams.find(t => t.id.toString() === teamId);
    setSelectedTeam(team);
  };

  const handleAssociation = async () => {
    if (!selectedMaterial || !selectedTeam) return;

    const { data, error } = await supabase
      .from('vianney_inventaire_materiel')
      .update({ associated_team_id: selectedTeam.id })
      .eq('id', selectedMaterial.id);

    if (error) {
      console.error('Erreur lors de l\'association du matériel à l\'équipe', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'association du matériel à l'équipe.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      console.log('Matériel associé à l\'équipe avec succès', data);
      toast({
        title: "Succès",
        description: `Le matériel "${selectedMaterial.nom}" a été associé à l'équipe "${selectedTeam.name_of_the_team}" avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Text>Chargement...</Text>;
  if (materiels.length === 0) return <Text>Aucun matériel enregistré.</Text>;

  return (
    <Box padding="4">
      <InputGroup marginBottom="4">
        <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.300" />} />
        <Input
          placeholder="Rechercher un matériel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <InputGroup marginBottom="4">
        <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.300" />} />
        <Input
          placeholder="Rechercher une équipe..."
          value={teamSearchTerm}
          onChange={(e) => {
            setTeamSearchTerm(e.target.value);
            setFilteredTeams(teams.filter(team => team.name_of_the_team.toLowerCase().includes(e.target.value.toLowerCase())));
            if (e.target.value) {
              const selectedTeam = teams.find(team => team.name_of_the_team.toLowerCase() === e.target.value.toLowerCase());
              if (selectedTeam) {
                setTeamContext(selectedTeam.name_of_the_team);
              }
            }
          }}
        />
      </InputGroup>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px">
        {filteredMateriels.map((materiel) => (
          <Box key={materiel.id} p="4" shadow="md" borderWidth="1px" borderRadius="md" bg="white">
            <VStack spacing="4">
              <Badge colorScheme="orange">{materiel.nom}</Badge>
              <Alert status={materiel.associated_team_id ? "success" : "warning"} variant="left-accent">
                <AlertIcon />
                {materiel.associated_team_name ? `Le matériel "${materiel.nom}" est associé à l'équipe "${materiel.associated_team_name}"` : `Aucune équipe n'est associée au matériel "${materiel.nom}". Matériel libre.`}
              </Alert>
              <QRCode value={materiel.id} size={128} level="L" includeMargin={true} />
              {materiel.description && (
                <Alert status="info" variant="left-accent">
                  <AlertIcon />
                  {materiel.description}
                </Alert>
              )}
              <HStack spacing="4">
                <Tooltip label="Supprimer" hasArrow>
                  <IconButton
                    aria-label="Supprimer matériel"
                    icon={<MdDeleteForever />}
                    colorScheme="red"
                    onClick={() => handleDeleteConfirmation(materiel.id)}
                  />
                </Tooltip>
                <Tooltip label="Associer à une autre équipe" hasArrow>
                  <IconButton
                    aria-label="Associer à une autre équipe"
                    icon={<FcOk />}
                    colorScheme="gray"
                    onClick={() => handleOpenAssociationModal(materiel)}
                  />
                </Tooltip>
                <Tooltip label="Rendre le matériel" hasArrow>
                  <IconButton
                    aria-label="Rendre le matériel"
                    icon={<FcDisclaimer />}
                    colorScheme="gray"
                    onClick={() => handleReturnMaterial(materiel.id)}
                  />
                </Tooltip>
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalBody>
            Voulez-vous vraiment supprimer ce matériel ?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleDelete}>Oui, Supprimer</Button>
            <Button ml="4" onClick={onClose}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isAssociationModalOpen} onClose={onAssociationModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Associer à une équipe</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {eventDisplay}
              {loadingTeams ? (
                <Text>Chargement des équipes...</Text>
              ) : (
                <Select placeholder="Sélectionner une équipe" onChange={handleTeamChange}>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name_of_the_team}
                    </option>
                  ))}
                </Select>
              )}

              {selectedMaterial ? (
                <Badge colorScheme="green" p="2">
                  {selectedMaterial.nom} (Sélectionné)
                </Badge>
              ) : (
                <Select placeholder="Sélectionner un matériel" onChange={(e) => {
                  const selected = materiels.find(materiel => materiel.id.toString() === e.target.value);
                  setSelectedMaterial(selected);
                }}>
                  {materiels.map((materiel) => (
                    <option key={materiel.id} value={materiel.id}>
                      {materiel.nom}
                    </option>
                  ))}
                </Select>
              )}

              <Button onClick={handleAssociation}>Associer matériel à l'équipe</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AfficherMateriels;
