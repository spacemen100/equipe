// src/views/admin/Materiel/components/VideoCaptureBisBis.jsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capacitor-community/camera-preview';
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
  const canvasRef = useRef(null);
  const [materiel, setMateriel] = useState(null);
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);
  const [noMatchingMaterial, setNoMatchingMaterial] = useState(false);
  const history = useHistory();
  const [streamError, setStreamError] = useState(false);
  const toast = useToast();
  const { selectedTeam, teamUUID, setSelectedTeam } = useTeam();
  const isNativeApp = Capacitor.isNativePlatform();

  const isValidUUID = (id) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

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
        description: `Le matériel a été associé à l'équipe "${selectedTeam}" avec succès.`,
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
  }, [teamUUID, selectedTeam, toast]);

  const fetchMateriel = useCallback(async (id) => {
    try {
      if (!isValidUUID(id)) {
        setNoMatchingMaterial(true);
        return;
      }

      const { data, error } = await supabase
        .from("vianney_inventaire_materiel")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setNoMatchingMaterial(true);
      } else {
        setMateriel(data);
        setNoMatchingMaterial(false);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  }, []);

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

  const handleRetryAccess = async () => {
    await enableStream();
  };

  useEffect(() => {
    enableStream();
    return () => {
      if (isNativeApp) {
        CameraPreview.stop();
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [enableStream, isNativeApp]);

  const handleScanNewQRCode = () => {
    setIsQRCodeDetected(false);
    setMateriel(null);
    enableStream();
  };

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

  const [materiels, setMateriels] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
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
        const currentEvent = data.find(event => event.event_id === selectedEventId);
        if (currentEvent) setSelectedEventName(currentEvent.event_name);
      }
      setLoadingEvents(false);
    };

    fetchEvents();
  }, [selectedEventId]);

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
  }, []);

  const handleOpenAssociationModal = (materiel) => {
    setSelectedMaterial(materiel);
    onAssociationModalOpen();
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

  return (
    <Box
      pt={{ base: "180px", md: "80px", xl: "80px" }}
      alignItems="center"
      justifyContent="center"
    >
      {/* Bouton de retour vers les matériels */}
      <Button onClick={() => history.push('/admin/materiels')} colorScheme="blue" mb={4}>
        Retour vers matériel
      </Button>

      {/* Afficher le scanner */}
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

      {/* Bouton pour lancer le scan si besoin (optionnel, ici déjà lancé automatiquement) */}
      {!isQRCodeDetected && !isNativeApp && (
        <Button onClick={enableStream} colorScheme="green" mt={4}>
          Lancer le scan QR Code
        </Button>
      )}

      {materiel && (
        <Box alignItems="center" display="flex" flexDirection="column" justifyContent="center">
          <Box padding="4" maxW="500px" >
            <Box key={materiel.id} p="4" shadow="md" borderWidth="1px" borderRadius="md" bg="white">
              <VStack spacing="4">
                <Badge colorScheme="orange">{materiel.nom}</Badge>
                <Alert status={materiel.associated_team_id ? "success" : "warning"} variant="left-accent">
                  <AlertIcon />
                  {materiel.associated_team_id
                    ? `Le matériel "${materiel.nom}" est associé à l'équipe "${selectedTeam ? selectedTeam.name_of_the_team : 'Inconnue'}"`
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

            {/* Modal pour associer le matériel à une équipe */}
            <Modal isOpen={isAssociationModalOpen} onClose={onAssociationModalClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Associer à une équipe</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4} align="stretch">
                    {/* Affichage de l'événement sélectionné */}
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

                    {/* Affichage du matériel sélectionné */}
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
        </Box>
      )}

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

      {/* Canvas pour le traitement des images QR Code en natif */}
      {isNativeApp && <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>}
    </Box>
  );
};

export default VideoCaptureBisBis;
