// src/TeamSelectionModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import TeamSelection from './TeamSelection';
import { useTeam } from './views/admin/InterfaceEquipe/TeamContext';

const TeamSelectionModal = () => {
  const { selectedTeam } = useTeam();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [teamSelected, setTeamSelected] = useState(false);

  useEffect(() => {
    if (!selectedTeam) {
      onOpen();
    }
  }, [selectedTeam, onOpen]);

  const handleTeamSelected = (teamName) => {
    setTeamSelected(true);
  };

  useEffect(() => {
    if (teamSelected) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [teamSelected, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Selectionnez votre équipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TeamSelection onTeamSelected={handleTeamSelected} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TeamSelectionModal;
