// AfficherMaterielsBis.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from './../../../../supabaseClient';
import { ModalCloseButton, Box, Text, SimpleGrid, VStack, Badge, Alert, AlertIcon, IconButton, Tooltip, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, useToast, HStack, Select } from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import { MdDeleteForever } from "react-icons/md";
import { FcDisclaimer, FcOk } from "react-icons/fc";
import { useEvent } from './../../../../EventContext';

const AfficherMaterielsBis = ({ filteredUUID }) => {
    const [materiels, setMateriels] = useState([]);
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

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('vianney_event')
                .select('*');
            if (error) {
                console.error('Erreur lors de la récupération des événements', error);
            } else {
                setEvents(data);
                // Trouver le nom de l'événement actuellement sélectionné
                const currentEvent = data.find(event => event.event_id === selectedEventId);
                if (currentEvent) setSelectedEventName(currentEvent.event_name);
            }
            setLoadingEvents(false);
        };

        fetchEvents();
    }, [selectedEventId, setLoadingEvents, setEvents]);

    useEffect(() => {
        const fetchTeams = async () => {
            if (!selectedEventId) return; // Utilisez selectedEventId ici
            setLoadingTeams(true);
            const { data, error } = await supabase
                .from('vianney_teams')
                .select('*')
                .eq('event_id', selectedEventId); // Correction pour utiliser selectedEventId

            if (error) {
                console.error('Erreur lors de la récupération des équipes', error);
                setTeams([]); // S'assurer que teams est réinitialisé en cas d'erreur
            } else {
                setTeams(data);
            }
            setLoadingTeams(false);
        };

        fetchTeams();
    }, [selectedEventId]); // Dépendance mise à jour pour réagir aux changements de selectedEventId   

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
                // Filtrer les matériaux en fonction de l'UUID scanné
                const filteredMateriels = materielsData.filter(materiel => materiel.id === filteredUUID);
                setMateriels(filteredMateriels);
            }
            setLoading(false);
        };

        chargerMateriels();
    }, [filteredUUID]); // Mise à jour lorsque filteredUUID change

    const handleOpenAssociationModal = (materiel) => {
        setSelectedMaterial(materiel); // This sets the selected material
        onAssociationModalOpen(); // Opens the modal
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
                // Mettre à jour l'état local pour refléter la suppression
                setMateriels(materiels.filter(materiel => materiel.id !== confirmDeleteId));
                onClose(); // Fermer le modal de confirmation
                setConfirmDeleteId(null); // Réinitialiser l'id de confirmation
                // Afficher un toast de succès
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

        // Mettre à jour la base de données
        const { error } = await supabase.from('vianney_inventaire_materiel').update({ associated_team_id: null }).match({ id });
        if (error) {
            console.error('Erreur lors de la mise à jour du matériel', error);
        } else {
            // Afficher un toast de succès
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
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px">
                {materiels.map((materiel) => (
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
                                        onClick={() => handleDeleteConfirmation(materiel.id)} // Confirmation avant suppression
                                    />
                                </Tooltip>
                                <Tooltip label="Associer à une autre équipe" hasArrow>
                                    <IconButton
                                        aria-label="Associer à une autre équipe"
                                        icon={<FcOk />}
                                        colorScheme="gray"
                                        onClick={() => handleOpenAssociationModal(materiel)} // Ouverture du modal avec le matériel sélectionné
                                    />
                                </Tooltip>
                                <Tooltip label="Rendre le matériel" hasArrow>
                                    <IconButton
                                        aria-label="Rendre le matériel"
                                        icon={<FcDisclaimer />}
                                        colorScheme="gray"
                                        onClick={() => handleReturnMaterial(materiel.id)} // Rendre le matériel
                                    />
                                </Tooltip>
                            </HStack>
                        </VStack>
                    </Box>
                ))}
            </SimpleGrid>
            {/* Modal de confirmation de la suppression */}
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
                <Modal isOpen={isAssociationModalOpen} onClose={onAssociationModalClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Associer à une équipe</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
                                {/* Remplacement du Select par le Badge pour l'événement */}
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

                                {/* Here we check if a material is already selected. If so, display a Badge instead of the Select component */}
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
            </Modal>
        </Box>
    );
};

export default AfficherMaterielsBis;