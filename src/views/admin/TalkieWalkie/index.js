import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Card, CardBody, useColorModeValue, Flex } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import io from "socket.io-client";

const TalkieWalkie = () => {
  const [isCommunicationActive, setIsCommunicationActive] = useState(false);
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
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
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

      setIsCommunicationActive(true);
    } catch (error) {
      console.error("Erreur lors de la récupération du flux audio :", error);
    }
  };

  const stopCommunication = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsCommunicationActive(false);
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

  const toggleSpeaking = (isSpeaking) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isSpeaking;
      });
    }
  };

  const bgColor = useColorModeValue("gray.50", "gray.700");

  return (
    <Box>
      <Card bg={bgColor}>
        <CardBody>
          <Flex direction="column" align="center">
            {/* Gros bouton rond pour démarrer/arrêter la communication */}
            <Button
              colorScheme={isCommunicationActive ? "green" : "red"}
              onClick={isCommunicationActive ? stopCommunication : startCommunication}
              mb={4}
              width="100px"
              height="100px"
              borderRadius="full"
              fontSize="xl"
            >
              {isCommunicationActive ? "Arrêter" : "Démarrer"}
            </Button>

            {/* Gros bouton rond pour parler */}
            <Button
              leftIcon={<FaMicrophone />}
              colorScheme="blue"
              size="lg"
              borderRadius="full"
              onMouseDown={() => toggleSpeaking(true)}
              onMouseUp={() => toggleSpeaking(false)}
              onTouchStart={() => toggleSpeaking(true)}
              onTouchEnd={() => toggleSpeaking(false)}
              isDisabled={!isCommunicationActive}
              width="100px"
              height="100px"
              fontSize="xl"
            >
              Parler
            </Button>
          </Flex>
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
