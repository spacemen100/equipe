import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';

const VideoCapture = () => {
  const videoRef = useRef(null);
  const [qrCodeText, setQrCodeText] = useState('');

  useEffect(() => {
    // Initialisation du flux vidéo
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Commence à scanner le QR code dès que le flux vidéo est prêt
        scanQRCode(stream);
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    enableStream();
  }, []);

  const scanQRCode = (stream) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const checkQRCode = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrCodeText(code.data); // QR code trouvé, mise à jour de l'état
          stream.getTracks().forEach(track => track.stop()); // Arrêt du flux vidéo
          return; // Arrêt de la fonction
        }
      }
      requestAnimationFrame(checkQRCode); // Continue à vérifier le QR code si non trouvé
    };

    checkQRCode();
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%' }} />
      {qrCodeText && (
        <div>
          <h2>QR Code Detected:</h2>
          <p>{qrCodeText}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCapture;