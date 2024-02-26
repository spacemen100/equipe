// src/views/admin/Parameters/components/ParametersDocuments.js
import React from 'react';
import { Box, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { FcAdvertising, FcGlobe, FcBusinessman, FcDepartment, FcCalendar } from "react-icons/fc";

const ParametersDocuments = ({ onEventAndCharacteristicsClick }) => {
  const brandColor = useColorModeValue("brand.500", "white");
  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonTextColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box border='1px' borderColor='gray.200' p={5} m={5}>
      <Text fontSize='xl' m={4}>Evènements</Text>
      <Button
        leftIcon={<FcAdvertising size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4}
        onClick={onEventAndCharacteristicsClick}
      >
        Evènement et caractéristiques
      </Button>
      
      <Button
        leftIcon={<FcGlobe size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin bottom for spacing
      >
        Géolocalisation
      </Button>

      <Button
        leftIcon={<FcBusinessman size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin bottom for spacing
      >
        Personnels
      </Button>

      <Button
        leftIcon={<FcDepartment size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin bottom for spacing
      >
        Salle de crise
      </Button>

      <Button
        leftIcon={<FcCalendar size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin bottom for spacing
      >
        Emploi du temps
      </Button>

      {/* Add more content here */}
    </Box>
  );
};

export default ParametersDocuments;
