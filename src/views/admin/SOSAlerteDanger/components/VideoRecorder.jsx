import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure

const VideoRecorder = ({ uuid, setSupabaseURL }) => {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [localUUID, setLocalUUID] = useState('');
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);
  const canvasRef = useRef();

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

  const getMediaDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  };

  const getMediaStream = async (deviceId) => {
    return await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined },
      audio: true // Including audio stream
    });
  };

  const startRecording = useCallback(async () => {
    if (!localUUID) {
      alert('Please enter a UUID before starting the recording.');
      return;
    }
    setRecording(true);
    recordedChunksRef.current = [];

    const videoDevices = await getMediaDevices();
    if (videoDevices.length < 2) {
      alert('This device does not have multiple cameras.');
      return;
    }

    const frontCamera = videoDevices.find(device => device.label.toLowerCase().includes('front'));
    const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));

    if (!frontCamera || !backCamera) {
      alert('Front or back camera not found.');
      return;
    }

    const frontStream = await getMediaStream(frontCamera.deviceId);
    const backStream = await getMediaStream(backCamera.deviceId);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frontVideo = document.createElement('video');
    const backVideo = document.createElement('video');

    frontVideo.srcObject = frontStream;
    backVideo.srcObject = backStream;
    frontVideo.play();
    backVideo.play();

    const drawVideo = () => {
      ctx.drawImage(frontVideo, 0, 0, canvas.width, canvas.height / 2);
      ctx.drawImage(backVideo, 0, canvas.height / 2, canvas.width, canvas.height / 2);
      requestAnimationFrame(drawVideo);
    };

    frontVideo.onloadedmetadata = () => {
      canvas.width = Math.max(frontVideo.videoWidth, backVideo.videoWidth);
      canvas.height = frontVideo.videoHeight + backVideo.videoHeight;
      drawVideo();
    };

    const combinedStream = canvas.captureStream();
    videoRef.current.srcObject = combinedStream;

    mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

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
      frontStream.getTracks().forEach(track => track.stop());
      backStream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.start();
    setTimeout(() => {
      stopRecording();
    }, 100000); // Stop recording after 10 seconds
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
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default VideoRecorder;
