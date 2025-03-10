import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { GiWalkieTalkie } from "react-icons/gi";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import io from "socket.io-client";

const TalkieWalkie = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCommunicationActive, setIsCommunicationActive] = useState(false); // État pour suivre si la communication est active
  const [showInfo, setShowInfo] = useState(true);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("https://renderservertalkiewalkie.onrender.com");

    socketRef.current.on("offer", async (offer) => {
      await handleOffer(offer);
    });

    socketRef.current.on("answer", async (answer) => {
      await handleAnswer(answer);
    });

    socketRef.current.on("candidate", async (candidate) => {
      await handleCandidate(candidate);
    });

    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const startCommunication = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      peerConnectionRef.current = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("candidate", event.candidate);
        }
      };
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);

      setIsCommunicationActive(true); // Activer l'état de communication
    } catch (error) {
      console.error("Erreur lors de la récupération du flux audio :", error);
    }
  };

  const stopCommunication = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop()); // Arrêter les pistes audio
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close(); // Fermer la connexion WebRTC
    }
    setIsCommunicationActive(false); // Désactiver l'état de communication
    setIsSpeaking(false); // Désactiver l'état de parole
  };

  const handleOffer = async (offer) => {
    if (!peerConnectionRef.current) {
      await startCommunication();
    }
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.emit("answer", answer);
  };

  const handleAnswer = async (answer) => {
    await peerConnectionRef.current.setRemoteDescription(answer);
  };

  const handleCandidate = async (candidate) => {
    await peerConnectionRef.current.addIceCandidate(candidate);
  };

  const toggleSpeaking = () => {
    setIsSpeaking((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const bgColor = useColorModeValue("gray.50", "gray.700");

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Card bg={bgColor}>
        <CardHeader>
          <Flex align="center">
            <IconButton
              icon={<GiWalkieTalkie size="24px" />}
              size="lg"
              aria-label="Talkie-Walkie"
              mr={2}
              colorScheme="teal"
            />
            <Text fontSize="xl" fontWeight="bold">Canal de discussion Talkie-Walkie</Text>
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Note d'information */}
          {showInfo && (
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Comment utiliser le Talkie-Walkie ?</AlertTitle>
                <AlertDescription>
                  1. Cliquez sur "Démarrer la communication" pour activer le microphone.
                  <br />
                  2. Appuyez sur "Parler" pour activer votre microphone et communiquer.
                  <br />
                  3. Relâchez le bouton "Parler" pour écouter l'autre utilisateur.
                </AlertDescription>
              </Box>
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
                onClick={() => setShowInfo(false)}
              />
            </Alert>
          )}

          {/* Bouton pour démarrer/arrêter la communication */}
          <Button
            colorScheme={isCommunicationActive ? "green" : "red"}
            onClick={isCommunicationActive ? stopCommunication : startCommunication}
            mb={4}
            width="full"
          >
            {isCommunicationActive ? "Arrêter la communication (On)" : "Démarrer la communication (Off)"}
          </Button>

          {/* Bouton pour parler */}
          <Button
            leftIcon={isSpeaking ? <FaMicrophoneSlash /> : <FaMicrophone />}
            colorScheme={isSpeaking ? "red" : "blue"}
            onClick={toggleSpeaking}
            mb={4}
            width="full"
            isDisabled={!isCommunicationActive} // Désactiver le bouton si la communication n'est pas active
          >
            {isSpeaking ? "Arrêter de parler" : "Parler"}
          </Button>
        </CardBody>
        <CardFooter>
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />
        </CardFooter>
      </Card>
    </Box>
  );
};

export default TalkieWalkie;