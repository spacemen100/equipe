// views/admin/Index.jsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import MessagerieWhatsappChat from './components/MessagerieWhatsappChat';
import TalkieWalkie from './../TalkieWalkie/index'; // Importez le composant TalkieWalkie

const Index = () => {
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      {/* Composant MessagerieWhatsappChat */}
      <MessagerieWhatsappChat />

      {/* Composant TalkieWalkie en dessous */}
      <Box mt={1}> {/* Ajoutez une marge en haut pour espacer les composants */}
        <TalkieWalkie />
      </Box>
    </Box>
  );
};

export default Index;