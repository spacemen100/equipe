// views/admin/TalkieWalkie.js
import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { GiWalkieTalkie } from "react-icons/gi";
import io from "socket.io-client";

const TalkieWalkie = () => {
  const [isSpeaking, setIsSpeaking] = useState(false); // État pour savoir si l'utilisateur parle
  const localAudioRef = useRef(null); // Référence pour l'audio local
  const remoteAudioRef = useRef(null); // Référence pour l'audio distant
  const socketRef = useRef(null); // Référence pour le socket
  const localStreamRef = useRef(null); // Référence pour le flux audio local
  const peerConnectionRef = useRef(null); // Référence pour la connexion WebRTC

  // Connexion au serveur WebSocket pour la signalisation
  useEffect(() => {
    // Remplacez l'URL par celle de votre serveur WebSocket déployé sur Render
    socketRef.current = io("https://renderservertalkiewalkie.onrender.com");

    // Écouter les messages de signalisation
    socketRef.current.on("offer", async (offer) => {
      console.log("Offer reçu :", offer);
      await handleOffer(offer);
    });

    socketRef.current.on("answer", async (answer) => {
      console.log("Answer reçu :", answer);
      await handleAnswer(answer);
    });

    socketRef.current.on("candidate", async (candidate) => {
      console.log("Candidate reçu :", candidate);
      await handleCandidate(candidate);
    });

    // Nettoyer la connexion lors du démontage du composant
    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  // Démarrer la communication audio
  const startCommunication = async () => {
    try {
      // Obtenir le flux audio de l'utilisateur
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Afficher l'audio local (optionnel)
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      // Créer une connexion WebRTC
      peerConnectionRef.current = new RTCPeerConnection();

      // Ajouter le flux audio à la connexion WebRTC
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Écouter les candidats ICE (pour établir la connexion)
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("candidate", event.candidate);
        }
      };

      // Écouter le flux audio distant
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Créer une offre et l'envoyer à l'autre utilisateur
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);
    } catch (error) {
      console.error("Erreur lors de la récupération du flux audio :", error);
    }
  };

  // Gérer une offre reçue
  const handleOffer = async (offer) => {
    if (!peerConnectionRef.current) {
      await startCommunication();
    }
    await peerConnectionRef.current.setRemoteDescription(offer);

    // Créer une réponse et l'envoyer
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.emit("answer", answer);
  };

  // Gérer une réponse reçue
  const handleAnswer = async (answer) => {
    await peerConnectionRef.current.setRemoteDescription(answer);
  };

  // Gérer un candidat ICE reçu
  const handleCandidate = async (candidate) => {
    await peerConnectionRef.current.addIceCandidate(candidate);
  };

  // Activer/désactiver la parole
  const toggleSpeaking = () => {
    setIsSpeaking((prev) => !prev);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Flex align="center" mb={4}>
        <IconButton
          icon={<GiWalkieTalkie size="24px" />}
          size="lg"
          aria-label="Talkie-Walkie"
          mr={2}
        />
        <Text fontSize="xl" fontWeight="bold">Canal de discussion Talkie-Walkie</Text>
      </Flex>

      {/* Bouton pour démarrer la communication */}
      <Button colorScheme="blue" onClick={startCommunication} mb={4}>
        Démarrer la communication
      </Button>

      {/* Bouton pour parler */}
      <Button
        colorScheme={isSpeaking ? "red" : "green"}
        onClick={toggleSpeaking}
        mb={4}
      >
        {isSpeaking ? "Arrêter de parler" : "Parler"}
      </Button>

      {/* Audio local (optionnel) */}
      <audio ref={localAudioRef} autoPlay muted />

      {/* Audio distant */}
      <audio ref={remoteAudioRef} autoPlay />
    </Box>
  );
};

export default TalkieWalkie;