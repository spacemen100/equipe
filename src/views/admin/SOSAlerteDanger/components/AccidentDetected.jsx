import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
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
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon } from '@chakra-ui/icons';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure
import { useTeam } from './../../InterfaceEquipe/TeamContext'; // Import the useTeam hook
import { useEvent } from './../../../../EventContext'; // Import the useEvent hook
import { MediaContext } from '../../../../MediaContext';

const DEFAULT_TEAM_ID = '00000000-0000-0000-0000-000000000000'; // Default team_id for "Aucune équipe"
const DEFAULT_TEAM_NAME = 'Aucune équipe'; // Default team_name

const AccidentDetected = () => {
  const [counter, setCounter] = useState(30); // 30 seconds countdown
  const [step, setStep] = useState(1); // Step tracker
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { stream, videoRef } = useContext(MediaContext);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [alertId, setAlertId] = useState(null); // Store the ID of the inserted alert
  const [videoUrl, setVideoUrl] = useState(''); // Store the video URL
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

  const handleDataAvailable = useCallback((event) => {
    if (event.data.size > 0) {
      console.log('Data available from media recorder:', event.data); // Debug log
      setRecordedChunks(prev => prev.concat(event.data));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      console.log('Recording stopped'); // Debug log
    }
  }, [videoRef]);

  const startRecording = useCallback(() => {
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.start();
      // Stop recording after 100 seconds (100,000 milliseconds)
      setTimeout(stopRecording, 100000);
    }
  }, [stream, handleDataAvailable, stopRecording]);

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

  const updateAlertData = async (id, videoUrl) => {
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
  };

  const uploadVideoToSupabase = async (blob) => {
    const fileName = `sos_recording_${new Date().toISOString()}.webm`;
    console.log('Uploading video:', fileName); // Debug log
    const { data, error } = await supabase
      .storage
      .from('sos-alerts-video')
      .upload(fileName, blob);

    if (error) {
      console.error('Error uploading video:', error);
      return null;
    } else {
      const videoUrl = `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/sos-alerts-video/${data.path}`;
      console.log('Video uploaded:', videoUrl); // Debug log
      setVideoUrl(videoUrl); // Set the video URL state
      return videoUrl;
    }
  };

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
  }, [counter, step]);

  useEffect(() => {
    // Update the alert data with the video URL once the URL is available
    if (videoUrl && alertId) {
      updateAlertData(alertId, videoUrl);
    }
  }, [videoUrl, alertId]);

  const triggerSOS = () => {
    setStep(2);
    setCounter(30); // Reset the counter to 30 seconds when SOS is triggered
  };

  const confirmSOS = async () => {
    setStep(3);
    try {
      const location = await getCurrentLocation();
      const currentTime = new Date().toISOString();
      await saveAlertData(location.latitude, location.longitude, currentTime);
      startRecording();
      // Wait for 10 seconds before uploading video and updating alert data
      setTimeout(async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = await uploadVideoToSupabase(blob);
        if (videoUrl && alertId) {
          await updateAlertData(alertId, videoUrl);
        }
      }, 10000);
    } catch (error) {
      console.error('Error in location or recording:', error);
    }
  };

  const cancelAlert = () => {
    setCounter(30);
    setStep(1);
    stopRecording();
    onClose();
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
          {videoUrl && (
            <VStack spacing={4}>
              <Text fontSize="md" fontWeight="bold">
                URL de l'enregistrement :
              </Text>
              <Input value={videoUrl} isReadOnly />
            </VStack>
          )}
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
