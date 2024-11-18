import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { supabase } from './../../../../supabaseClient';
import {
  ModalCloseButton, Box, Text, VStack, Badge, Alert, AlertIcon, IconButton,
  Tooltip, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, useToast, HStack, Select
} from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import { FcDisclaimer, FcOk } from "react-icons/fc";
import { useEvent } from './../../../../EventContext';
import { useHistory } from 'react-router-dom';
import { useTeam } from './../../../../views/admin/InterfaceEquipe/TeamContext';

const VideoCaptureBisBis = () => {
  const videoRef = useRef(null);
  const [materiel, setMateriel] = useState(null);
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);
  const [noMatchingMaterial, setNoMatchingMaterial] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const { selectedTeam, teamUUID, setSelectedTeam } = useTeam();

  const associateMaterialToTeam = useCallback(async (materialId) => {
    if (!teamUUID) {
      console.error("No team selected.");
      toast({
        title: "Erreur",
        description: "Aucune équipe sélectionnée pour associer le matériel.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vianney_inventaire_materiel')
        .update({ associated_team_id: teamUUID })
        .eq('id', materialId)
        .select('*') // Récupérer toutes les colonnes
        .single();

      if (error) {
        throw error;
      }

      console.log('Matériel associé à l\'équipe avec succès', data);
      toast({
        title: "Succès",
        description: `Le matériel a été associé à l'équipe "${selectedTeam}" avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Mettre à jour l'état local avec les données complètes du matériel
      setMateriel(data);
      setNoMatchingMaterial(false);
    } catch (error) {
      console.error('Erreur lors de l\'association du matériel à l\'équipe', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'association du matériel à l'équipe.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [teamUUID, selectedTeam, toast]);

  const fetchMateriel = useCallback(async (id) => {
    try {
      if (!isValidUUID(id)) {
        setNoMatchingMaterial(true);
        return;
      }

      const { data, error } = await supabase
        .from('vianney_inventaire_materiel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setNoMatchingMaterial(true);
      } else {
        setMateriel(data);
        setNoMatchingMaterial(false);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  }, []);

  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const scanQRCode = useCallback((stream) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const checkQRCode = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Add design and target square
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        ctx.strokeRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          console.log('Données extraites du QR code :', code.data);
          fetchMateriel(code.data);
          associateMaterialToTeam(code.data);
          stream.getTracks().forEach(track => track.stop());
          setIsQRCodeDetected(true);
          return;
        }
      }
      requestAnimationFrame(checkQRCode);
    };

    checkQRCode();
  }, [fetchMateriel, associateMaterialToTeam]);

  const enableStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      scanQRCode(stream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  }, [scanQRCode]);

  useEffect(() => {
    enableStream();
  }, [enableStream]);

  const handleScanNewQRCode = () => {
    setIsQRCodeDetected(false);
    setMateriel(null);
    enableStream();
  };

  // Optional: Redirect if no team is selected
  useEffect(() => {
    if (!teamUUID) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une équipe avant de scanner un matériel.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      history.goBack(); // Redirect back if no team is selected
    }
  }, [teamUUID, toast, history]);
  const [materiels, setMateriels] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [events, setEvents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedEvent, setSelectedEvent] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [loadingEvents, setLoadingEvents] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { isOpen, onClose } = useDisclosure();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { isOpen: isAssociationModalOpen, onOpen: onAssociationModalOpen, onClose: onAssociationModalClose } = useDisclosure();
  const [teams, setTeams] = useState([]);
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
        // Récupérer également les données des équipes associées
        const { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('*');
        if (teamsError) {
          console.error('Erreur lors de la récupération des équipes', teamsError);
        } else {
          // Mettre à jour les données des matériels avec les noms des équipes associées
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

  const handleOpenAssociationModal = (materiel) => {
    setSelectedMaterial(materiel); // This sets the selected material
    onAssociationModalOpen(); // Opens the modal
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

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }} alignItems="center" justifyContent="center">
      <div>
        <Button onClick={() => history.goBack()} colorScheme="blue" mb={4}>
          Retour à mon matériel
        </Button>
        {!isQRCodeDetected && (
          <div style={{ position: 'relative', minWidth: '100%', borderRadius: '10px' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%' }} />
            <div style={{ position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%', border: '2px solid #00ff00', borderRadius: '10px' }}></div>
          </div>
        )}
        {materiel && (
          <Box alignItems="center" display="flex" flexDirection="column" justifyContent="center">
            <Box padding="4" maxW="500px" >
              <Box key={materiel.id} p="4" shadow="md" borderWidth="1px" borderRadius="md" bg="white">
                <VStack spacing="4">
                  <Badge colorScheme="orange">{materiel.nom}</Badge>
                  <Alert status={materiel.associated_team_id ? "success" : "warning"} variant="left-accent">
                    <AlertIcon />
                    {materiel.associated_team_id ? `Le matériel "${materiel.nom}" est associé à l'équipe "${selectedTeam}"` : `Aucune équipe n'est associée au matériel "${materiel.nom}". Matériel libre.`}
                  </Alert>
                  <QRCode value={materiel.id} size={128} level="L" includeMargin={true} />
                  {materiel.description && (
                    <Alert status="info" variant="left-accent">
                      <AlertIcon />
                      {materiel.description}
                    </Alert>
                  )}
                  <HStack spacing="4">
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
              {/* Ajouter le bouton pour scanner un nouveau QR code */}
              {isQRCodeDetected && (
                <Button onClick={handleScanNewQRCode} colorScheme="green" mt={4}>
                  Scanner un nouveau QRCode de matériel
                </Button>
              )}
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
          </Box>
        )}
        {noMatchingMaterial && (
          <Box>
            <Alert status="error">
              <AlertIcon />
              Aucun matériel correspondant trouvé. Ce QR code ne correspond pas à un matériel de la base de donnée ou de l'événement en cours.
            </Alert>
          </Box>
        )}
      </div>
    </Box>
  );
};

export default VideoCaptureBisBis;
