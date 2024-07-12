// src/MediaContext.js
import React, { createContext, useState, useRef, useEffect } from 'react';

const MediaContext = createContext();

const MediaProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing media devices', err);
      }
    };

    getMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <MediaContext.Provider value={{ stream, videoRef }}>
      {children}
    </MediaContext.Provider>
  );
};

export { MediaContext, MediaProvider };
