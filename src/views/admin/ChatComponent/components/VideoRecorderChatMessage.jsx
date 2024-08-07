import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure

const VideoRecorderChatMessage = ({ selectedEventId, selectedTeam, onNewVideoMessage }) => {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const uploadVideoToSupabase = useCallback(async (blob) => {
    const fileName = `chat_video_${new Date().toISOString()}.webm`;
    try {
      const { data, error } = await supabase
        .storage
        .from('chat-audio')
        .upload(fileName, blob);

      if (error) {
        console.error('Error uploading video:', error);
        alert('Error uploading video');
      } else {
        const videoUrl = `https://your-supabase-instance.supabase.co/storage/v1/object/public/chat-audio/${data.path}`;
        console.log('Video uploaded:', videoUrl);
        
        // Save the video URL to the vianney_chat_messages table
        const { data: insertedData, error: insertError } = await supabase
          .from('vianney_chat_messages')
          .insert({
            alert_text: 'Video Message', // You can customize this or make it dynamic
            user_id: selectedTeam, // Assuming selectedTeam is the team's UUID
            solved_or_not: 'info',
            details: 'Video message details', // Optional: Add details or make it dynamic
            event_id: selectedEventId,
            audio_url: videoUrl, // Storing the video URL in the audio_url field
            team_name: selectedTeam,
          });

        if (insertError) {
          console.error('Error saving video message:', insertError);
          alert('Error saving video message');
        } else {
          console.log('Video message saved:', insertedData);
          onNewVideoMessage(insertedData[0]); // Notify parent component of the new message
          alert('Video message saved successfully');
        }
      }
    } catch (error) {
      console.error('Unexpected error uploading video:', error);
      alert('Unexpected error uploading video');
    }
  }, [selectedEventId, selectedTeam, onNewVideoMessage]);

  const startRecording = useCallback(async () => {
    setRecording(true);
    recordedChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: true // Requesting audio along with video
    });
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
  }, [stopRecording, uploadVideoToSupabase]);

  useEffect(() => {
    // Auto-start recording if needed, or manually start with a button
  }, [startRecording]);

  const downloadVideo = () => {
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = 'recorded_video.webm';
    a.click();
  };

  return (
    <div>
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

export default VideoRecorderChatMessage;
