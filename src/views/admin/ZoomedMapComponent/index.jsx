import React, { useEffect } from 'react';
import { Modal, Box, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, Button, useDisclosure } from '@chakra-ui/react';
import MapComponent from './../InterfaceEquipe/components/MapComponent'; // Ajustez le chemin d'importation selon la structure de votre projet
import { useHistory } from 'react-router-dom'; // Importez useHistory depuis react-router-dom

const MapModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory(); // Initialisez useHistory

  // Utilisez useEffect pour ouvrir le modal dès que le composant est monté
  useEffect(() => {
    onOpen();
  }, [onOpen]); // onOpen est mis dans le tableau de dépendances pour s'assurer qu'il est défini

  // Fonction pour gérer la redirection vers "/admin/map"
  const handleRedirect = () => {
    history.push("/admin/map");
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Button onClick={onOpen}>Réouvrir la carte</Button> {/* Le bouton reste visible pour une réouverture manuelle */}
      <Modal isOpen={isOpen} onClose={() => { onClose(); handleRedirect(); }} size="full" motionPreset="slideInBottom">
      <ModalOverlay />
        <ModalContent maxW="100vw">
          <ModalCloseButton />
          <ModalBody padding="0">
            <MapComponent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MapModal;