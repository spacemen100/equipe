import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { supabase } from '../../../../supabaseClient'; // Adjust the path based on where you've set up your client

const VideoCaptureBis = () => {
  const videoRef = useRef(null);
        // eslint-disable-next-line no-unused-vars
  const [qrCodeText, setQrCodeText] = useState(''); // This state tracks the text of the scanned QR code
  const [itemDetails, setItemDetails] = useState(null); // This state stores the item details fetched from Supabase

  // Fetch item details based on the QR code text
  const fetchItemDetails = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('vianney_inventaire_materiel')
        .select('*')
        .eq('id', id)
        .single(); // Fetch a single row that matches the ID

      if (error) {
        throw error;
      }

      setItemDetails(data); // Update state with the item details
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  }, []);

  // Define scanQRCode using useCallback
  const scanQRCode = useCallback((stream) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const checkQRCode = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          setQrCodeText(code.data); // QR code found, update state with its text
          fetchItemDetails(code.data); // Fetch item details based on QR code text
          stream.getTracks().forEach(track => track.stop()); // Stop video stream as soon as QR code is found
          return;
        }
      }
      requestAnimationFrame(checkQRCode); // Continue checking for QR code if not found
    };

    checkQRCode();
  }, [fetchItemDetails]);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        scanQRCode(stream);
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    enableStream();
  }, [scanQRCode]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%' }} />
      {itemDetails && (
        <div>
          <h2>Item Details:</h2>
          <p>Name: {itemDetails.nom}</p>
          <p>Description: {itemDetails.description}</p>
          <p>Color: {itemDetails.couleur}</p>
          <p>Associated Team ID: {itemDetails.associated_team_id}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCaptureBis;