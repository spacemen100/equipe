import React, { useState, useEffect, useRef } from 'react';
import { ChakraProvider, Box, VStack, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb} from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeMute, FaVolumeUp, FaRecordVinyl, FaStop } from 'react-icons/fa';
import Peer from 'simple-peer';
import io from 'socket.io-client'; 
import { supabase } from './../../../../supabaseClient';

const socket = io('your_signaling_server_url'); 

function AudioSpace() {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const peerRef = useRef();
  const audioRef = useRef();
  const mediaRecorder = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((userStream) => {
        setStream(userStream);
        peerRef.current = new Peer({ initiator: true, stream: userStream });
        peerRef.current.on('signal', (data) => {
          socket.emit('signal', data);
        });
        peerRef.current.on('stream', (remoteStream) => {
          setPeers((prevPeers) => [...prevPeers, { peer: peerRef.current, stream: remoteStream }]);
        });
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    socket.on('signal', (data) => {
      peerRef.current.signal(data);
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      setPeers([]);
      if (stream) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks[0].stop();
        }
      }
    };
  }, [stream]);

  useEffect(() => {
    let timeoutId;

    const handleInactivity = () => {
      setIsMuted(true);
    };

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, 60000);
    };

    const handleClick = () => {
      setIsMuted((prevIsMuted) => !prevIsMuted);
      resetInactivityTimer();
    };

    window.addEventListener('click', handleClick);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('click', handleClick);
      clearTimeout(timeoutId);
    };
  }, [isMuted]);

  useEffect(() => {
    if (recording && stream) {
      const chunks = [];
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/mp3' // Set the MIME type to audio/mp3
      });
      mediaRecorder.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' }); // Change the blob type to audio/mp3
        setRecordedChunks(chunks);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'recorded_audio.mp3'; // Change the file extension to .mp3
        a.click();
        window.URL.revokeObjectURL(url);
      };
      mediaRecorder.current.start();
    } else if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }

    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, [recording, stream]);

  const toggleMute = () => {
    setIsMuted((prevIsMuted) => !prevIsMuted);
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        track.enabled = !track.enabled;
      }
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/mp3' }); // Change the blob type to audio/mp3
      const fileName = 'recorded_audio.mp3'; // Change the file name to .mp3
      const file = new File([blob], fileName);
  
      supabase.storage
        .from('your_recording')
        .upload(fileName, file)
        .then((response) => {
          console.log('File uploaded:', response);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };
  

  return (
    <Box>
      <VStack spacing={4}>
        <IconButton
          icon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        />
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
          <FaVolumeMute style={{ marginRight: '8px' }} />
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            aria-label="Volume Control"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <FaVolumeUp style={{ marginLeft: '8px' }} />
        </div>
        {recording ? (
          <IconButton
            icon={<FaStop />}
            onClick={stopRecording}
            aria-label="Stop Recording"
          />
        ) : (
          <IconButton
            icon={<FaRecordVinyl />}
            onClick={startRecording}
            aria-label="Start Recording"
          />
        )}
        {peers.map((peerData, index) => (
          <div key={index}>
            <audio ref={audioRef} autoPlay muted={isMuted}></audio>
          </div>
        ))}
      </VStack>
    </Box>
  );
}

function Audio() {
  return (
    <ChakraProvider>
      <AudioSpace />
    </ChakraProvider>
  );
}

export default Audio;