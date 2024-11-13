import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  Button,
  VStack,
  CircularProgress,
  CircularProgressLabel,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Box
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon } from '@chakra-ui/icons';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure
import { useTeam } from './../../InterfaceEquipe/TeamContext'; // Import the useTeam hook
import { useEvent } from './../../../../EventContext'; // Import the useEvent hook
import VideoRecorder from './VideoRecorder'; // Adjust the import according to your project structure

const DEFAULT_TEAM_ID = '00000000-0000-0000-0000-000000000000'; // Default team_id for "Aucune équipe"
const DEFAULT_TEAM_NAME = 'Aucune équipe'; // Default team_name

const AccidentDetected = () => {
  const [counter, setCounter] = useState(30); // 30 seconds countdown
  const [step, setStep] = useState(1); // Step tracker
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [alertId, setAlertId] = useState(null); // Store the ID of the inserted alert
  const [supabaseURL, setSupabaseURL] = useState(''); // State for Supabase URL
  const { teamUUID, selectedTeam } = useTeam(); // Use the useTeam hook to get teamUUID and selectedTeam
  const { selectedEventId } = useEvent(); // Use the useEvent hook to get the selectedEventId

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location obtained:', position.coords); // Debug log
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(error);
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
        reject(new Error('Geolocation not supported'));
      }
    });
  }, []);

  const saveAlertData = useCallback(async (lat, long, timeForUser) => {
    console.log('Saving alert data:', { lat, long, timeForUser }); // Debug log
    const { data, error } = await supabase
      .from('vianney_sos_alerts')
      .insert([{
        team_id: teamUUID || DEFAULT_TEAM_ID,
        latitude: lat,
        longitude: long,
        created_at: new Date().toISOString(),
        time_for_user: timeForUser,
        url: '', // Empty URL initially
        team_name: selectedTeam || DEFAULT_TEAM_NAME,
        event_id: selectedEventId,
      }])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', data);
      if (data && data.length > 0) {
        setAlertId(data[0].id); // Store the ID of the inserted alert
      }
    }
  }, [teamUUID, selectedTeam, selectedEventId]);

  const updateAlertData = useCallback(async (id, videoUrl) => {
    console.log('Updating alert data with URL:', { id, videoUrl }); // Debug log
    const { data, error } = await supabase
      .from('vianney_sos_alerts')
      .update({ url: videoUrl })
      .eq('id', id);

    if (error) {
      console.error('Error updating data:', error);
    } else {
      console.log('Data updated successfully:', data);
    }
  }, []);

  const confirmSOS = useCallback(async () => {
    setStep(3);
    try {
      const location = await getCurrentLocation();
      const currentTime = new Date().toISOString();
      await saveAlertData(location.latitude, location.longitude, currentTime);
    } catch (error) {
      console.error('Error in location or recording:', error);
    }
  }, [getCurrentLocation, saveAlertData]);

  useEffect(() => {
    let timer;
    if (step === 2 && counter > 0) {
      timer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);
    } else if (counter === 0 && step === 2) {
      confirmSOS();
    }
    return () => clearInterval(timer);
  }, [counter, step, confirmSOS]);

  useEffect(() => {
    if (supabaseURL && alertId) {
      updateAlertData(alertId, supabaseURL);
    }
  }, [supabaseURL, alertId, updateAlertData]);

  useEffect(() => {
    if (step === 3) {
      document.querySelector('#startRecordingButton')?.click();
      setTimeout(() => {
        document.querySelector('#stopRecordingButton')?.click();
      }, 5000); // Arrête l'enregistrement après 5 secondes
    }
  }, [step]);

  // Define triggerSOS before using it in useEffect
  const triggerSOS = useCallback(() => {
    setStep(2);
    setCounter(30); // Reset the counter to 30 seconds when SOS is triggered
  }, []);


  // Automatically click the "Déclencher un SOS" button after 3 seconds
  useEffect(() => {
    if (step === 1) {
      const sosTimer = setTimeout(() => {
        triggerSOS();
      }, 3000);
      return () => clearTimeout(sosTimer);
    }
  }, [step, triggerSOS]); // Added triggerSOS to the dependency array

  const cancelAlert = useCallback(() => {
    setCounter(30);
    setStep(1);
    onClose();
  }, [onClose]);

  return (
    <Center height="100vh" bg="gray.50" p={4}>
      {step === 1 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold">
            Déclencher un SOS
          </Text>
          <Button
            leftIcon={<PhoneIcon />}
            colorScheme="red"
            size="lg"
            width="100%"
            onClick={triggerSOS}
          >
            Déclencher un SOS
          </Button>
        </VStack>
      )}
      {step === 2 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Text fontSize="lg" color="red.500" fontWeight="bold">
            SOS-sans contact
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            Demande d'aide
          </Text>
          <Text fontSize="md" color="gray.500">
            Envoi de l'alerte dans
          </Text>
          <CircularProgress
            value={(counter / 30) * 100}
            size="120px"
            color="green.400"
          >
            <CircularProgressLabel>{counter}s</CircularProgressLabel>
          </CircularProgress>
          <VStack spacing={4} width="100%">
            <Button
              leftIcon={<PhoneIcon />}
              colorScheme="red"
              size="lg"
              width="100%"
              onClick={confirmSOS}
            >
              Je confirme le SOS
            </Button>
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="green"
              size="lg"
              width="100%"
              onClick={onOpen}
            >
              Je vais bien
            </Button>
          </VStack>
        </VStack>
      )}
      {step === 3 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Alerte déclenchée!</AlertTitle>
            <AlertDescription>
              Une alerte a été envoyée.
              {latitude && longitude && (
                <Text mt={4}>
                  Ma position GPS est: latitude: {latitude}, longitude: {longitude}
                </Text>
              )}
            </AlertDescription>
          </Alert>
          {supabaseURL && (
            <Box display="none">
              <VStack spacing={4}>
                <Text fontSize="md" fontWeight="bold">
                  Supabase URL :
                </Text>
                <Input value={supabaseURL} isReadOnly />
              </VStack>
            </Box>
          )}
          {/* Hidden VideoRecorder component */}
          <Box display="none">
            <VideoRecorder uuid={alertId} setSupabaseURL={setSupabaseURL} />
          </Box>
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alerte</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Annuler l'alerte ?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Non
            </Button>
            <Button variant="ghost" onClick={cancelAlert}>
              Oui
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

export default AccidentDetected;
