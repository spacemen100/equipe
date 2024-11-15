import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  Button,
  VStack,
  CircularProgress,
  CircularProgressLabel,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { supabase } from './../../../../supabaseClient'; // Adjust according to your project structure
import { useTeam } from './../../InterfaceEquipe/TeamContext'; // Import the useTeam hook
import { useEvent } from './../../../../EventContext'; // Import the useEvent hook

const DEFAULT_TEAM_ID = '00000000-0000-0000-0000-000000000000'; // Default team_id for "Aucune équipe"
const DEFAULT_TEAM_NAME = 'Aucune équipe'; // Default team_name

const AccidentDetected = () => {
  const [counter, setCounter] = useState(30); // 30 seconds countdown
  const [step, setStep] = useState(1); // Step tracker
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [alertId, setAlertId] = useState(null);
  const [supabaseURL, setSupabaseURL] = useState('');
  const { teamUUID, selectedTeam } = useTeam();
  const { selectedEventId } = useEvent();
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting GPS position:', error);
            resolve({ latitude: null, longitude: null }); // Continue with null values
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        resolve({ latitude: null, longitude: null });
      }
    });
  }, []);

  const saveAlertData = useCallback(async (lat, long, timeForUser) => {
    console.log('Saving alert data:', { lat, long, timeForUser });
    const { data, error } = await supabase
      .from('vianney_sos_alerts')
      .insert([{
        team_id: teamUUID || DEFAULT_TEAM_ID,
        latitude: lat || null,
        longitude: long || null,
        created_at: new Date().toISOString(),
        time_for_user: timeForUser,
        url: '',
        team_name: selectedTeam || DEFAULT_TEAM_NAME,
        event_id: selectedEventId,
      }])
      .select();
  
    if (error) {
      console.error('Error inserting data into alerts table:', error);
    } else if (data?.length) {
      console.log('Alert saved successfully:', data[0]);
      setAlertId(data[0].id);
    }
  }, [teamUUID, selectedTeam, selectedEventId]);  

  const uploadVideoToSupabase = useCallback(async (blob) => {
    const fileName = `sos_recording_${new Date().toISOString()}.webm`;
    try {
      const { data, error } = await supabase
        .storage
        .from('sos-alerts-video')
        .upload(fileName, blob);
  
      if (error) {
        console.error('Error uploading video:', error);
        alert('Erreur lors du téléchargement de la vidéo. Veuillez vérifier le bucket.');
        return;
      }
  
      const videoUrl = `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/sos-alerts-video/${data.path}`;
      setSupabaseURL(videoUrl); // Sauvegarde l'URL dans l'état
      console.log('Video uploaded successfully:', videoUrl);
    } catch (err) {
      console.error('Unexpected error uploading video:', err);
      alert('Erreur inattendue lors du téléchargement de la vidéo.');
    }
  }, []);  

  const startRecording = useCallback(async () => {
    setRecording(true);
    recordedChunksRef.current = [];
    console.log('Starting recording...');
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
  
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Recording chunk received:', event.data.size);
        recordedChunksRef.current.push(event.data);
      }
    };
  
    mediaRecorderRef.current.onstop = () => {
      console.log('Recording stopped.');
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      console.log('Blob created:', blob);
      uploadVideoToSupabase(blob);
      stream.getTracks().forEach(track => track.stop());
    };
  
    mediaRecorderRef.current.start();
    setTimeout(() => stopRecording(), 5000);
  }, [uploadVideoToSupabase]);
  

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const confirmSOS = useCallback(async () => {
    setStep(3);
    const location = await getCurrentLocation();
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    await saveAlertData(location.latitude, location.longitude, new Date().toISOString());
    startRecording();
  }, [getCurrentLocation, saveAlertData, startRecording]);

  const cancelSOS = useCallback(() => {
    setStep(1);
    setCounter(30);
    setLatitude(null);
    setLongitude(null);
    setAlertId(null);
    setSupabaseURL('');
  }, []);

  useEffect(() => {
    if (supabaseURL && alertId) {
      const updateAlert = async () => {
        try {
          const { data, error } = await supabase
            .from('vianney_sos_alerts')
            .update({ url: supabaseURL })
            .eq('id', alertId);
  
          if (error) {
            console.error('Error updating alert data with video URL:', error);
          } else {
            console.log('Alert updated successfully with video URL:', data);
          }
        } catch (err) {
          console.error('Unexpected error updating alert with video URL:', err);
        }
      };
      updateAlert();
    }
  }, [supabaseURL, alertId]);  

  useEffect(() => {
    let timer;
    if (step === 2 && counter > 0) {
      timer = setInterval(() => setCounter((prev) => prev - 1), 1000);
    } else if (counter === 0 && step === 2) {
      confirmSOS();
    }
    return () => clearInterval(timer);
  }, [step, counter, confirmSOS]);

  return (
    <Center height="100vh" bg="gray.50" p={4}>
      {step === 1 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold">Déclencher un SOS</Text>
          <Button leftIcon={<PhoneIcon />} colorScheme="red" size="lg" onClick={() => setStep(2)}>
            Déclencher un SOS
          </Button>
        </VStack>
      )}
      {step === 2 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Text fontSize="lg" color="red.500" fontWeight="bold">SOS-sans contact</Text>
          <Text fontSize="2xl" fontWeight="bold">Demande d'aide</Text>
          <Text fontSize="md" color="gray.500">Envoi de l'alerte dans</Text>
          <CircularProgress value={(counter / 30) * 100} size="120px" color="green.400">
            <CircularProgressLabel>{counter}s</CircularProgressLabel>
          </CircularProgress>
          <Button leftIcon={<CheckIcon />} colorScheme="green" onClick={confirmSOS}>
            Confirmer l'alerte
          </Button>
          <Button leftIcon={<CloseIcon />} colorScheme="red" onClick={cancelSOS}>
            Annuler l'alerte
          </Button>
        </VStack>
      )}
      {step === 3 && (
        <VStack spacing={8} bg="white" p={6} rounded="md" shadow="md">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Alerte déclenchée!</AlertTitle>
            <AlertDescription>
              Une alerte a été envoyée.
              {latitude && longitude && <Text>GPS: {latitude}, {longitude}</Text>}
            </AlertDescription>
          </Alert>
          <video ref={videoRef} autoPlay muted style={{ width: '400px' }} />
        </VStack>
      )}
    </Center>
  );
};

export default AccidentDetected;
