import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import io from "socket.io-client";

const TalkieWalkie = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCommunicationActive, setIsCommunicationActive] = useState(false); // État pour suivre si la communication est active
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
      console.log("Stream audio local:", stream);
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });
      stream.getTracks().forEach((track) => {
        console.log("Ajout de la piste audio:", track);
        peerConnectionRef.current.addTrack(track, stream);
      });
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Candidat ICE local:", event.candidate);
          socketRef.current.emit("candidate", event.candidate);
        }
      };
      peerConnectionRef.current.ontrack = (event) => {
        console.log("Réception du flux audio distant:", event.streams[0]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };
      const offer = await peerConnectionRef.current.createOffer();
      console.log("Offre créée:", offer);
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);
  
      setIsCommunicationActive(true);
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
    <Box>
      <Card bg={bgColor}>
        <CardBody>
          {/* Bouton pour démarrer/arrêter la communication */}
          <Button
            colorScheme={isCommunicationActive ? "green" : "red"}
            onClick={isCommunicationActive ? stopCommunication : startCommunication}
            mb={4}
            width="full"
          >
            {isCommunicationActive ? "Arrêter le Talkie Walkie (On)" : "Démarrer le Talkie Walkie (Off)"}
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
        <div>
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      </Card>
    </Box>
  );
};

export default TalkieWalkie;