import React, { useState, useRef, useEffect, useCallback } from 'react';

const VideoRecorder = ({ uuid }) => {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [localUUID, setLocalUUID] = useState('');
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (uuid) {
      setLocalUUID(uuid);
    }
  }, [uuid]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!localUUID) {
      alert('Please enter a UUID before starting the recording.');
      return;
    }
    setRecording(true);
    recordedChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.start();
    setTimeout(() => {
      stopRecording();
    }, 10000); // Stop recording after 10 seconds
  }, [localUUID, stopRecording]);

  useEffect(() => {
    if (localUUID) {
      startRecording();
    }
  }, [localUUID, startRecording]);

  const downloadVideo = () => {
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = 'recorded_video.webm';
    a.click();
  };

  const uploadVideo = async () => {
    if (!videoURL) {
      alert('No video to upload.');
      return;
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recorded_video.webm');
    formData.append('uuid', localUUID);

    try {
      const response = await fetch('https://your-server-endpoint.com/vianney_sos_alerts', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      alert(`Upload successful: ${result.message}`);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="uuid">UUID:</label>
        <input
          id="uuid"
          type="text"
          value={localUUID}
          onChange={(e) => setLocalUUID(e.target.value)}
          readOnly
        />
      </div>
      <video ref={videoRef} autoPlay muted style={{ width: '400px' }}></video>
      <div>
        {!recording && <button onClick={startRecording}>Start Recording</button>}
        {recording && <button onClick={stopRecording}>Stop Recording</button>}
      </div>
      {videoURL && (
        <div>
          <video src={videoURL} controls style={{ width: '400px' }}></video>
          <button onClick={downloadVideo}>Download Video</button>
          <button onClick={uploadVideo}>Upload Video</button>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
