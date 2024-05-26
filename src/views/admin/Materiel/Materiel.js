import React, { useState } from 'react';
import { Flex, useColorModeValue, Box, Heading, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Icon } from '@chakra-ui/react';
import { FcPlus } from "react-icons/fc";
import InventaireForm from './components/InventaireForm';
import AfficherMateriels from './components/AfficherMateriels';
import QrCodeImageExport from './components/QrCodeImageExport';
import VideoCaptureBisBis from './components/VideoCaptureBisBis';

const Materiel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleCreateMaterialModal = () => setShowCreateMaterial(!showCreateMaterial);
  const toggleQRScannerModal = () => setShowQRScannerModal(!showQRScannerModal);

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Flex justifyContent="flex-start" alignItems="center" mb="4">
        <Heading color={textColor} fontSize='2xl' fontWeight='700' lineHeight='100%' mr={4}>Liste des Matériels</Heading>
        {/* Wrapper Flex pour les boutons */}
        <Flex>
          <Button
            onClick={toggleCreateMaterialModal}
            leftIcon={<Icon as={FcPlus} />}
            colorScheme='blue'
            variant='solid'
            size='md'
            boxShadow='sm'
            _hover={{ boxShadow: 'md' }}
            _active={{ boxShadow: 'lg' }}
            mr={2} // Ajoutez une marge à droite pour espacer les boutons
          >
            Créer un matériel
          </Button>
          <Button
            onClick={toggleQRScannerModal} // Ajout de l'événement onClick
            leftIcon={<Icon as={FcPlus} />} // Changez cette icône selon vos besoins
            colorScheme='blue'
            variant='solid'
            size='md'
            boxShadow='sm'
            _hover={{ boxShadow: 'md' }}
            _active={{ boxShadow: 'lg' }}
            mr={2} // Ajoutez une marge à droite pour espacer les boutons
          >
            Scanner un QR Code
          </Button>
          <Button
            onClick={openModal}
            leftIcon={<Icon as={FcPlus} />} // Changez cette icône selon vos besoins
            colorScheme='blue'
            variant='solid'
            size='md'
            boxShadow='sm'
            _hover={{ boxShadow: 'md' }}
            _active={{ boxShadow: 'lg' }}
          >
            Feuille d'impression des étiquettes
          </Button>
        </Flex>
      </Flex>

      <AfficherMateriels />

      <Modal isOpen={isOpen} onClose={closeModal} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <QrCodeImageExport />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeModal}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal pour la création d'un matériel */}
      <Modal isOpen={showCreateMaterial} onClose={toggleCreateMaterialModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Créer un matériel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InventaireForm />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={toggleCreateMaterialModal}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal pour le scanner QR */}
      <Modal isOpen={showQRScannerModal} onClose={toggleQRScannerModal} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody
          >
            <VideoCaptureBisBis />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={toggleQRScannerModal}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Materiel;