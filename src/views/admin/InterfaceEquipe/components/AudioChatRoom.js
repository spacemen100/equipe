import React from 'react';

const AudioChatRoom = () => {
    const subdomain = "hello-audioroom-1938"; // Your template subdomain
    const roomCode = "AR-sparkling-lake-812677"; // Your room code

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <iframe
                title="100ms-audio-room"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                src={`https://${subdomain}.app.100ms.live/meeting/${roomCode}`}
                style={{ border: 'none', height: '100%', width: '100%' }}
            />
        </div>
    );
};

export default AudioChatRoom;