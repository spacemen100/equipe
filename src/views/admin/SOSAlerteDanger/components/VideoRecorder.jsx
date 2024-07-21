import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure

const VideoRecorder = ({ uuid, setSupabaseURL }) => {
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

  const uploadVideoToSupabase = useCallback(async (blob) => {
    const fileName = `sos_recording_${new Date().toISOString()}.webm`;
    try {
      const { data, error } = await supabase
        .storage
        .from('sos-alerts-video')
        .upload(fileName, blob);

      if (error) {
        console.error('Error uploading video:', error);
        alert('Error uploading video');
      } else {
        const videoUrl = `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/sos-alerts-video/${data.path}`;
        console.log('Video uploaded:', videoUrl);
        setSupabaseURL(videoUrl); // Set the Supabase URL state in parent component
        alert('Video uploaded successfully');
      }
    } catch (error) {
      console.error('Unexpected error uploading video:', error);
      alert('Unexpected error uploading video');
    }
  }, [setSupabaseURL]);

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
      uploadVideoToSupabase(blob); // Upload the video to Supabase after recording stops
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.start();
    setTimeout(() => {
      stopRecording();
    }, 10000); // Stop recording after 10 seconds
  }, [localUUID, stopRecording, uploadVideoToSupabase]);

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
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
