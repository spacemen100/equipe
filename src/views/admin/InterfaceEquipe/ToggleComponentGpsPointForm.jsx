import React, { useState } from 'react';
import { Box, IconButton, VStack, Tooltip } from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import GpsPointForm from './GpsPointForm';  // Importer votre GpsPointForm

const ToggleComponentGpsPointForm = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <VStack align="start" spacing={4}>
      {/* Tooltip avec le message et le bouton avec icône pour montrer/masquer le GpsPointForm */}
      <Tooltip label="Centrer la carte sur un point fixe" aria-label="Centrer la carte">
        <IconButton
          aria-label={isVisible ? 'Masquer le formulaire GPS' : 'Montrer le formulaire GPS'}
          icon={isVisible ? <MinusIcon /> : <AddIcon />}
          onClick={toggleVisibility}
          colorScheme="teal"
        />
      </Tooltip>

      {/* Formulaire GPS qui sera affiché ou masqué */}
      {isVisible && (
        <Box
          w="100%"
          p={4}
          borderRadius="md"
          shadow="md"
        >
          <GpsPointForm />
        </Box>
      )}
    </VStack>
  );
};

export default ToggleComponentGpsPointForm;
