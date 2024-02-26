import React from 'react';
import { Box, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { FcBusiness, FcCalendar, FcHome, FcList, FcVoicePresentation } from "react-icons/fc";

const ParametersEventAndCharacteristics = () => {
  const brandColor = useColorModeValue("brand.500", "white");
  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonTextColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box border='1px' borderColor='gray.200' p={5} m={5}>
      <Text fontSize='xl' m={4}>Caractéristiques de l'Événement</Text>
      
      <Button
        leftIcon={<FcBusiness size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin for spacing
      >
        Nom de l'événement
      </Button>
      
      <Button
        leftIcon={<FcCalendar size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin for spacing
      >
        Date de l'événement
      </Button>

      <Button
        leftIcon={<FcHome size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin for spacing
      >
        Lieu de l'événement
      </Button>

      <Button
        leftIcon={<FcList size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin for spacing
      >
        Besoins
      </Button>

      <Button
        leftIcon={<FcVoicePresentation size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin for spacing
      >
        Mailing
      </Button>

      {/* Add more content here */}
    </Box>
  );
};

export default ParametersEventAndCharacteristics;
