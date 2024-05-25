import React, { useState } from 'react';
import jsQR from 'jsqr';

const QRImageScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            setScanResult(code.data);
          } else {
            setError("QR Code non trouvé dans l'image.");
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <p>{scanResult}</p>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default QRImageScanner;