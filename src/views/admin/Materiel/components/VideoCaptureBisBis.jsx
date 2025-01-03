// src/views/admin/Materiel/components/VideoCaptureBisBis.jsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { supabase } from './../../../../supabaseClient';
import {
  ModalCloseButton,
  Box,
  Text,
  VStack,
  Badge,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  HStack,
  Select
} from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import { MdDeleteForever } from "react-icons/md";
import { FcDisclaimer, FcOk } from "react-icons/fc";
import { useEvent } from './../../../../EventContext';
import { useHistory } from 'react-router-dom';
import { useTeam } from './../../../../views/admin/InterfaceEquipe/TeamContext';

const VideoCaptureBisBis = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // eslint-disable-next-line
  const [qrCodeText, setQrCodeText] = useState('');
  const [materiel, setMateriel] = useState(null);
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);
  const [noMatchingMaterial, setNoMatchingMaterial] = useState(false);
  const [streamError, setStreamError] = useState(false);
  
  const [materiels, setMateriels] = useState([]);
  // eslint-disable-next-line
  const [events, setEvents] = useState([]);
  // eslint-disable-next-line
  const [selectedEvent, setSelectedEvent] = useState('');
  // eslint-disable-next-line
  const [loadingEvents, setLoadingEvents] = useState(true);
  // eslint-disable-next-line
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAssociationModalOpen, onOpen: onAssociationModalOpen, onClose: onAssociationModalClose } = useDisclosure();
  
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  
  const { selectedEventId } = useEvent();
  const [selectedEventName, setSelectedEventName] = useState('');
  // eslint-disable-next-line
  const { selectedTeam: contextSelectedTeam, teamUUID, setSelectedTeam: setContextSelectedTeam } = useTeam();
  
  const history = useHistory();
  const toast = useToast();
  
  const isNativeApp = Capacitor.isNativePlatform();

  // Utility function to validate UUID
  const isValidUUID = (id) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Fetch materiel data based on QR code
  const fetchMateriel = useCallback(async (id) => {
    console.log(`Fetching materiel with ID: ${id}`);
    try {
      if (!isValidUUID(id)) {
        console.log("Invalid UUID detected.");
        setNoMatchingMaterial(true);
        return;
      }

      const { data, error } = await supabase
        .from('vianney_inventaire_materiel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching item details:', error);
        throw error;
      }

      if (!data) {
        console.log("No data found for the given ID.");
        setNoMatchingMaterial(true);
      } else {
        console.log("Materiel data fetched successfully:", data);
        setMateriel(data);
        setQrCodeText(data.id);
        setNoMatchingMaterial(false);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  }, []);

  // Associate materiel to team
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
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      console.log('Matériel associé à l\'équipe avec succès', data);
      toast({
        title: "Succès",
        description: `Le matériel a été associé à l'équipe "${contextSelectedTeam}" avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

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
  }, [teamUUID, contextSelectedTeam, toast]);

  const scanQRCodeWeb = useCallback(
    (stream) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const checkQRCode = () => {
        if (
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
        ) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            console.log("QR Code data:", code.data);
            fetchMateriel(code.data);
            associateMaterialToTeam(code.data);
            stream.getTracks().forEach((track) => track.stop());
            setIsQRCodeDetected(true);
            return;
          }
        }
        requestAnimationFrame(checkQRCode);
      };

      checkQRCode();
    },
    [fetchMateriel, associateMaterialToTeam]
  );

  // Scan QR Code on Native
  const scanQRCodeNative = useCallback(async () => {
    try {
      const interval = setInterval(async () => {
        const result = await CameraPreview.capture({
          quality: 90
        });
        const image = new Image();
        image.src = `data:image/jpeg;base64,${result.value}`;
        image.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            console.log("QR Code data:", code.data);
            fetchMateriel(code.data);
            associateMaterialToTeam(code.data);
            clearInterval(interval);
            CameraPreview.stop();
            setIsQRCodeDetected(true);
          }
        };
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du scan QR Code natif:", error);
    }
  }, [fetchMateriel, associateMaterialToTeam]);

  // Enable Camera Stream
  const enableStream = useCallback(async () => {
    if (isNativeApp) {
      try {
        await CameraPreview.start({
          position: 'rear',
          toBack: false,
          width: window.innerWidth,
          height: window.innerHeight,
          parent: 'cameraPreview',
          disableExifHeaderStripping: true,
        });
        scanQRCodeNative();
        setStreamError(false);
      } catch (err) {
        console.error('Erreur lors de l\'accès à la caméra sur la plateforme native', err);
        setStreamError(true);
        toast({
          title: "Erreur d'accès à la caméra",
          description: "Impossible d'accéder à la caméra sur l'appareil natif.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      try {
        const constraints = {
          video: { facingMode: "environment" },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        scanQRCodeWeb(stream);
        setStreamError(false);
      } catch (err) {
        console.error("Erreur lors de l'accès à la caméra :", err);
        setStreamError(true);

        if (err.name === "OverconstrainedError") {
          toast({
            title: "Erreur d'accès à la caméra",
            description:
              "Impossible d'accéder à la caméra avec les contraintes spécifiées. Essayez de changer de caméra.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (err.name === "NotAllowedError") {
          toast({
            title: "Accès à la caméra refusé",
            description:
              "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Erreur d'accès à la caméra",
            description:
              "Impossible d'accéder à la caméra. Vérifiez les permissions ou réessayez.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  }, [isNativeApp, scanQRCodeWeb, scanQRCodeNative, toast]);

  // Retry accessing camera
  const handleRetryAccess = async () => {
    await enableStream();
  };

  // Cleanup on component unmount
  useEffect(() => {
    enableStream();
    return () => {
      if (isNativeApp) {
        CameraPreview.stop();
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
                  // eslint-disable-next-line
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [enableStream, isNativeApp]);

  // Handle scanning a new QR code
  const handleScanNewQRCode = () => {
    setIsQRCodeDetected(false);
    setMateriel(null);
    enableStream();
  };

  // Ensure a team is selected before scanning
  useEffect(() => {
    if (!teamUUID) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une équipe avant de scanner un matériel.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      history.push("/admin/materiels");
    }
  }, [teamUUID, toast, history]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      console.log("Fetching events...");
      const { data, error } = await supabase
        .from('vianney_event')
        .select('*');
      if (error) {
        console.error('Erreur lors de la récupération des événements', error);
      } else {
        console.log("Events fetched successfully:", data);
        setEvents(data);
        const currentEvent = data.find(event => event.event_id === selectedEventId);
        if (currentEvent) {
          setSelectedEventName(currentEvent.event_name);
          console.log(`Selected Event: ${currentEvent.event_name}`);
        } else {
          console.log("No current event found.");
        }
      }
      setLoadingEvents(false);
    };

    fetchEvents();
  }, [selectedEventId]);

  // Fetch teams based on selected event
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedEventId) {
        console.log("No event selected. Skipping team fetch.");
        return;
      }
      console.log(`Fetching teams for event ID: ${selectedEventId}`);
      setLoadingTeams(true);
      const { data, error } = await supabase
        .from('vianney_teams')
        .select('*')
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Erreur lors de la récupération des équipes', error);
        setTeams([]); // Ensure teams are reset in case of error
      } else {
        console.log("Teams fetched successfully:", data);
        setTeams(data);
      }
      setLoadingTeams(false);
    };

    fetchTeams();
  }, [selectedEventId]);

  // Fetch and associate materiels with teams
  useEffect(() => {
    const chargerMateriels = async () => {
      console.log("Loading materiels...");
      const { data: materielsData, error: materielsError } = await supabase.from('vianney_inventaire_materiel').select('*');
      if (materielsError) {
        console.error('Erreur lors de la récupération des matériels', materielsError);
      } else {
        console.log("Materiels fetched successfully:", materielsData);
        const { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('*');
        if (teamsError) {
          console.error('Erreur lors de la récupération des équipes', teamsError);
        } else {
          const updatedMateriels = materielsData.map(materiel => {
            const associatedTeam = teamsData.find(team => team.id === materiel.associated_team_id);
            return {
              ...materiel,
              associated_team_name: associatedTeam ? associatedTeam.name_of_the_team : 'No team associated'
            };
          });
          setMateriels(updatedMateriels);
          console.log("Materiels after associating teams:", updatedMateriels);
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
  }, []);

  // Event Display Component
  const eventDisplay = selectedEventName ? (
    <Badge colorScheme="blue" p="2">
      {selectedEventName} (Sélectionné)
    </Badge>
  ) : (
    <Text>Chargement de l'événement...</Text>
  );

  // Open Association Modal
  const handleOpenAssociationModal = (materiel) => {
    console.log("Opening association modal for materiel:", materiel);
    setSelectedMaterial(materiel);
    onAssociationModalOpen();
  };

  // Handle Delete Confirmation
  const handleDeleteConfirmation = (id) => {
    console.log(`Confirming deletion for materiel ID: ${id}`);
    setConfirmDeleteId(id);
    onOpen();
  };

  // Handle Delete Action
  const handleDelete = async () => {
    if (confirmDeleteId) {
      console.log(`Deleting materiel with ID: ${confirmDeleteId}`);
      const { error } = await supabase.from('vianney_inventaire_materiel').delete().match({ id: confirmDeleteId });
      if (error) {
        console.error('Error deleting materiel:', error);
      } else {
        console.log(`Materiel with ID: ${confirmDeleteId} deleted successfully.`);
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

  // Handle Return Material
  const handleReturnMaterial = async (id) => {
    console.log(`Returning materiel with ID: ${id}`);
    const updatedMateriels = materiels.map(materiel => {
      if (materiel.id === id) {
        return { ...materiel, associated_team_id: null, associated_team_name: 'No team associated' };
      }
      return materiel;
    });
    setMateriels(updatedMateriels);

    const { error } = await supabase.from('vianney_inventaire_materiel').update({ associated_team_id: null }).match({ id });
    if (error) {
      console.error('Error returning materiel:', error);
    } else {
      console.log(`Materiel with ID: ${id} returned successfully.`);
      toast({
        title: "Matériel rendu avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Team Selection Change
  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    console.log(`Selected team ID: ${teamId}`);
    const team = teams.find(t => t.id.toString() === teamId);
    setSelectedTeam(team);
    if (team) {
      console.log(`Selected team: ${team.name_of_the_team}`);
    }
  };

  // Handle Association
  const handleAssociation = async () => {
    if (!selectedMaterial || !selectedTeam) {
      console.warn("Selected material or team is missing.");
      return;
    }

    console.log(`Associating materiel ID: ${selectedMaterial.id} with team ID: ${selectedTeam.id}`);
    // eslint-disable-next-line
    const { data, error } = await supabase
      .from('vianney_inventaire_materiel')
      .update({ associated_team_id: selectedTeam.id })
      .eq('id', selectedMaterial.id)
      .select('*')
      .single();

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
      console.log(`Materiel ID: ${selectedMaterial.id} associated with team ID: ${selectedTeam.id} successfully.`);
      const updatedMateriels = materiels.map(materiel => {
        if (materiel.id === selectedMaterial.id) {
          return { ...materiel, associated_team_id: selectedTeam.id, associated_team_name: selectedTeam.name_of_the_team };
        }
        return materiel;
      });
      setMateriels(updatedMateriels);
      toast({
        title: "Succès",
        description: `Le matériel "${selectedMaterial.nom}" a été associé à l'équipe "${selectedTeam.name_of_the_team}" avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onAssociationModalClose();
    }
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }} alignItems="center" justifyContent="center">
      <Box>
        {/* Back Button */}
        <Button onClick={() => history.push('/admin/materiels')} colorScheme="blue" mb={4}>
          Retour vers matériel
        </Button>

        {/* Scanner */}
        {!isQRCodeDetected && !streamError && (
          <Box width="100%" position="relative" borderRadius="10px">
            {isNativeApp ? (
              <div id="cameraPreview" style={{ width: '100%', height: '300px', borderRadius: '10px' }}></div>
            ) : (
              <div style={{ position: "relative", width: "100%", borderRadius: "10px" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", borderRadius: "10px" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "25%",
                    left: "25%",
                    width: "50%",
                    height: "50%",
                    border: "2px solid #00ff00",
                    borderRadius: "10px",
                  }}
                ></div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
            )}
          </Box>
        )}

        {/* Retry Camera Access */}
        {streamError && (
          <VStack spacing={4} mt={4}>
            <Alert status="warning">
              <AlertIcon />
              Impossible de démarrer la caméra. Vérifiez les permissions ou réessayez.
            </Alert>
            <Button onClick={handleRetryAccess} colorScheme="blue">
              Réessayer d'accéder à la caméra
            </Button>
          </VStack>
        )}

        {/* Optionally provide a manual scan button for web */}
        {!isQRCodeDetected && !isNativeApp && !streamError && (
          <Button onClick={enableStream} colorScheme="green" mt={4}>
            Lancer le scan QR Code
          </Button>
        )}

        {/* Display Materiel Details */}
        {materiel && (
          <Box alignItems="center" display="flex" flexDirection="column" justifyContent="center">
            <Box padding="4" maxW="500px">
              <Box key={materiel.id} p="4" shadow="md" borderWidth="1px" borderRadius="md" bg="white">
                <VStack spacing="4">
                  <Badge colorScheme="orange">{materiel.nom}</Badge>
                  <Alert status={materiel.associated_team_id ? "success" : "warning"} variant="left-accent">
                    <AlertIcon />
                    {materiel.associated_team_name
                      ? `Le matériel "${materiel.nom}" est associé à l'équipe "${materiel.associated_team_name}"`
                      : `Aucune équipe n'est associée au matériel "${materiel.nom}". Matériel libre.`}
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
            </Box>
            {/* Button to scan a new QR code */}
            {isQRCodeDetected && (
              <Button onClick={handleScanNewQRCode} colorScheme="green" mt={4}>
                Scanner un nouveau QRCode de matériel
              </Button>
            )}
          </Box>
        )}

        {/* No Matching Material Alert */}
        {noMatchingMaterial && (
          <Box>
            <Alert status="error">
              <AlertIcon />
              Aucun matériel correspondant trouvé. Ce QR code n'existe pas ou ne correspond à aucun matériel dans la base de données.
            </Alert>
            <Button onClick={handleScanNewQRCode} colorScheme="green" mt={4}>
              Scanner un autre QRCode
            </Button>
          </Box>
        )}

        {/* Confirmation Delete Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Voulez-vous vraiment supprimer ce matériel ?
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={handleDelete}>Oui, Supprimer</Button>
              <Button ml="4" onClick={onClose}>Annuler</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Association Modal */}
        <Modal isOpen={isAssociationModalOpen} onClose={onAssociationModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Associer à une équipe</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Display Selected Event */}
                {eventDisplay}
                {/* Select Team */}
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
                {/* Display Selected Material */}
                {selectedMaterial ? (
                  <Badge colorScheme="green" p="2">
                    {selectedMaterial.nom} (Selected)
                  </Badge>
                ) : (
                  <Select placeholder="Sélectionner un matériel" onChange={(e) => {
                    const selected = materiels.find(materiel => materiel.id.toString() === e.target.value);
                    setSelectedMaterial(selected);
                    if (selected) {
                      console.log(`Selected material for association: ${selected.nom}`);
                    }
                  }}>
                    {materiels.map((materiel) => (
                      <option key={materiel.id} value={materiel.id}>
                        {materiel.nom}
                      </option>
                    ))}
                  </Select>
                )}
                {/* Associate Button */}
                <Button onClick={handleAssociation} colorScheme="blue">Associer matériel à l'équipe</Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Canvas for QR Code Processing on Native */}
        {noMatchingMaterial && (
        <Alert status="error">
          <AlertIcon />
          Aucun matériel correspondant trouvé. Ce QR code n'existe pas.
        </Alert>
      )}

      {streamError && (
        <VStack spacing={4} mt={4}>
          <Alert status="warning">
            <AlertIcon />
            Impossible de démarrer la caméra. Vérifiez les permissions ou
            réessayez.
          </Alert>
          <Button onClick={handleRetryAccess} colorScheme="blue">
            Réessayer d'accéder à la caméra
          </Button>
        </VStack>
      )}
        {isNativeApp && <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>}
      </Box>
    </Box>
  );
};

export default VideoCaptureBisBis;
