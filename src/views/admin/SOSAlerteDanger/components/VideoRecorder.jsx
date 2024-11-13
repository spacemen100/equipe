import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from './../../../../supabaseClient';

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
        setSupabaseURL(videoUrl); // Pass the URL to the parent component
        console.log('Video uploaded successfully:', videoUrl);
      }
    } catch (error) {
      console.error('Unexpected error uploading video:', error);
      alert('Unexpected error uploading video');
    }
  }, [setSupabaseURL]);

  // Function to stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  // Function to start recording video and audio
  const startRecording = useCallback(async () => {
    setRecording(true);
    recordedChunksRef.current = [];

    // Request access to video and audio
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    videoRef.current.srcObject = stream;

    // Initialize MediaRecorder to capture video and audio
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoURL(url); // Save the video URL for local playback
      uploadVideoToSupabase(blob); // Upload the video to Supabase after recording stops
      stream.getTracks().forEach(track => track.stop()); // Stop video and audio stream
    };

    mediaRecorderRef.current.start();

    // Automatically stop recording after 10 seconds (adjustable)
    setTimeout(() => {
      stopRecording();
    }, 5000);
  }, [stopRecording, uploadVideoToSupabase]);

  // Automatically start recording when UUID is set
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
