import React, { useState, useEffect } from 'react';
import { Textarea, Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Box, Input, Button, VStack, Alert, AlertIcon, Text, Select, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { FcOk, FcDeleteDatabase, FcInfo } from "react-icons/fc";
import Card from "components/card/Card";
import Menu from "components/menu/MainMenuVianneyAlertChat";

// Initialize Supabase client
const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function VianneyAlertChat() {
  const [alertStatus, setAlertStatus] = useState('info'); // New state for alert status
  const [alerts, setAlerts] = useState([]);
  const [newAlertText, setNewAlertText] = useState('');
  const toast = useToast();
  const [details, setDetails] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [allowScrolling, setAllowScrolling] = useState(false);
  const [filter, setFilter] = useState('all');
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const openConfirmModal = (alertId) => {
    setAlertToDelete(alertId);
    setIsConfirmOpen(true);
  };
  const handlePasswordChange = (event) => {
    const inputPassword = event.target.value;
    setPassword(inputPassword);
    setIsPasswordCorrect(inputPassword === "vianney123");
  };
  const handleAllowScrollingToggle = () => {
    setAllowScrolling(!allowScrolling);
  };

  const openEditModal = (alert) => {
    setEditingAlert(alert);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleEditChange = (event) => {
    setEditingAlert({ ...editingAlert, [event.target.name]: event.target.value });
  };

  const handleSubmitEdit = async () => {
    const { error } = await supabase
      .from('vianney_alert')
      .update({
        alert_text: editingAlert.alert_text,
        details: editingAlert.details
        // Add other fields as necessary
      })
      .match({ id: editingAlert.id });

    if (!error) {
      // Update local state to reflect changes
      setAlerts(alerts.map(alert => alert.id === editingAlert.id ? editingAlert : alert));
      closeEditModal();
    } else {
      console.error('Error updating alert:', error);
    }
  };
  const handleSolveAlert = async (alertId) => {
    const { error } = await supabase
      .from('vianney_alert')
      .update({ solved_or_not: 'success' })
      .match({ id: alertId });

    if (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Erreur",
        description: "Nous ne sommes pas arrivés à mettre à jour le statut de l'alerte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Update the alerts state to reflect the change
      setAlerts(alerts.map(alert => alert.id === alertId ? { ...alert, solved_or_not: 'success' } : alert));
      toast({
        title: "Succès",
        description: "Statut de l'alerte mis à jour avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
  };


  const handleDeleteAlert = async () => {
    const { error } = await supabase
      .from('vianney_alert')
      .delete()
      .match({ id: alertToDelete });

    if (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Erreur",
        description: "Nous n'avons pass réussi à supprimer l'alerte.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      setAlerts(alerts.filter(alert => alert.id !== alertToDelete));
      toast({
        title: "Succès",
        description: "Alerte supprimée avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    closeConfirmModal();
    setIsConfirmOpen(false); // Close the modal after operation
  };
  const handleDetailsChange = (event) => {
    setDetails(event.target.value);
  };



  useEffect(() => {
    // Function to fetch alerts from Supabase
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('vianney_alert')
        .select('*')
        .order('timestamp', { ascending: true }); // Changed to true for chronological order

      if (error) console.log('Erreur lors de la récupération des alertes:', error);
      else setAlerts(data);
    };

    fetchAlerts();
  }, []);


  const handleStatusChange = (event) => {
    setAlertStatus(event.target.value);
  };

  const handleInputChange = (event) => {
    setNewAlertText(event.target.value);
  };

  const handleSubmit = async () => {
    if (newAlertText.trim() !== '') {
      const fakeUUID = '123e4567-e89b-12d3-a456-426614174000';

      const { error } = await supabase
        .from('vianney_alert')
        .insert([
          { alert_text: newAlertText, user_id: fakeUUID, solved_or_not: alertStatus, details: details } // Include details
        ]);

      if (!error) {
        const newAlert = {
          alert_text: newAlertText,
          user_id: fakeUUID,
          solved_or_not: alertStatus,
          timestamp: new Date().toISOString()
        };
        setAlerts([...alerts, newAlert]);
      }

      setNewAlertText('');
    }
  };
  const textColor = useColorModeValue("secondaryGray.900", "white");


  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  // Function to determine if an alert should be shown based on the current filter
  const shouldShowAlert = (alert) => {
    if (filter === 'all') return true;
    if (filter === 'success' && alert.solved_or_not === 'success') return true;
    if (filter === 'error' && alert.solved_or_not === 'error') return true;
    return false;
  };


  return (

    <Card
      direction='column'
      w='100%'
      px='0px'
      overflowX={{ sm: "scroll", lg: "hidden" }}>
      <Box p={4}>
        <Flex px='25px' justify='space-between' mb='20px' align='center'>
          <Text
            color={textColor}
            fontSize='22px'
            fontWeight='700'
            lineHeight='100%'>
            Table des alertes
          </Text>
          <Menu onFilterSelect={handleFilterSelect} onAllowScrollingToggle={handleAllowScrollingToggle} />

        </Flex>


        <VStack
          spacing={4}
          overflowY={allowScrolling ? "scroll" : "hidden"}
          maxHeight={allowScrolling ? "200px" : "none"}>
          {alerts.filter(shouldShowAlert).map((alert, index) => {
            const alertStatus = ['info', 'warning', 'success', 'error'].includes(alert.solved_or_not)
              ? alert.solved_or_not
              : 'info';

            return (
              <Alert key={index} status={alertStatus} minH="60px">
                <AlertIcon />
                <Box flex="1">
                  <Text>{alert.alert_text}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Text>
                </Box>
                <Tooltip label="Marqué comme résolue" hasArrow>
                  <Button mr="2px" onClick={() => handleSolveAlert(alert.id)}><FcOk /></Button>
                </Tooltip>
                <Tooltip label="Supprimer" hasArrow>
                  <Button mr="2px" onClick={() => openConfirmModal(alert.id)}><FcDeleteDatabase /></Button>
                </Tooltip>
                <Tooltip label="Information" hasArrow>
                  <Button onClick={() => openEditModal(alert)}><FcInfo /></Button>
                </Tooltip>
              </Alert>
            );
          })}
        </VStack>
        <Box mt={4}>
          <Select placeholder="Sélectionnez le degrès d'urgence" value={alertStatus} onChange={handleStatusChange}>
            <option value="error">Urgence</option>
            <option value="success">Problème résolu</option>
            <option value="warning">Avertissement</option>
            <option value="info">Information</option>
          </Select>
          <Input
            placeholder="Tapez votre alerte..."
            value={newAlertText}
            onChange={handleInputChange}
            mt={2}
          />
          <Textarea
            placeholder="Ajoutez des détails ici..."
            value={details}
            onChange={handleDetailsChange}
            mt={2}
          />
          <Button mt={2} colorScheme="blue" onClick={handleSubmit}>
            Ajouter une alerte
          </Button>
        </Box>
        <Modal isOpen={isEditOpen} onClose={closeEditModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modifier l'alerte</ModalHeader>
            <ModalBody>
              <Input
                name="alert_text"
                value={editingAlert?.alert_text || ''}
                onChange={handleEditChange}
                placeholder="Texte de l'alerte"
                mt={2}
              />
              <Textarea
                name="details"
                value={editingAlert?.details || ''}
                onChange={handleEditChange}
                placeholder="Détails de l'alerte"
                mt={2}
              />
              {/* Add other fields as necessary */}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSubmitEdit}>
                Enregistrer les modifications
              </Button>
              <Button variant="ghost" onClick={closeEditModal}>Annuler</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Supprimer l'alerte</ModalHeader>
            <ModalBody>
              Voulez-vous supprimer cette alerte ?
              <Input
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={handlePasswordChange}
                mt={2}
                type="password"
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={handleDeleteAlert}
                hidden={!isPasswordCorrect}
              >
                Supprimer
              </Button>

              <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>Annuler</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Card>
  );
}

export default VianneyAlertChat;
