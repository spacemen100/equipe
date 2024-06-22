// views/admin/NoteDeFraisComponent.jsx
import React from 'react';
import { Box} from '@chakra-ui/react';
import MessagerieWhatsappChat from './components/MessagerieWhatsappChat';

const NoteDeFraisComponent = () => {
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
        <MessagerieWhatsappChat/>
    </Box>
  );
};

export default NoteDeFraisComponent;