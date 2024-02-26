import React from 'react';
import { Box, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { FcDocument } from "react-icons/fc";

const ParametersEvents = () => {
  const brandColor = useColorModeValue("brand.500", "white");
  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonTextColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box border='1px' borderColor='gray.200' p={5} m={5}>
      <Text fontSize='xl' m={4}>Documents</Text>  
      <Button
        leftIcon={<FcDocument size='32px' color={brandColor} />}
        bg={buttonBg}
        color={buttonTextColor}
        h='100px'
        m={4} // Margin bottom for spacing
      >
        Documents missions
      </Button>

      {/* Add more content here */}
    </Box>
  );
};

export default ParametersEvents;
