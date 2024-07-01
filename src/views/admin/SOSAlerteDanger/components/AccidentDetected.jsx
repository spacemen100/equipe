import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon } from '@chakra-ui/icons';

const AccidentDetected = () => {
  const [counter, setCounter] = useState(30); // 30 seconds countdown
  const [step, setStep] = useState(1); // Step tracker
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  const startRecording = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.start();
      })
      .catch(error => console.error('Error accessing media devices.', error));
  }, []);

  useEffect(() => {
    let timer;
    if (step === 2 && counter > 0) {
      timer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);
    } else if (counter === 0) {
      setStep(3);
      getCurrentLocation();
      startRecording();
    }
    return () => clearInterval(timer);
  }, [counter, step, getCurrentLocation, startRecording]);

  const triggerSOS = () => {
    setStep(2);
  };

  const confirmSOS = () => {
    setStep(3);
    getCurrentLocation();
    startRecording();
  };

  const cancelAlert = () => {
    setCounter(30);
    setStep(1);
    stopRecording();
    onClose();
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordedChunks(prev => prev.concat(event.data));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, {
      type: 'video/webm',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'sos_recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Center height="100vh" bg="gray.50" p={4}>
      <video ref={videoRef} style={{ display: 'none' }} autoPlay />
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
          <Button colorScheme="blue" onClick={downloadRecording}>
            Télécharger l'enregistrement
          </Button>
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