// src/views/admin/Parameters/index.jsx
import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { IoIosArrowBack } from "react-icons/io";
import ParametersDocuments from './components/ParametersDocuments';
import ParametersEventAndCharacteristics from './components/ParametersEventAndCharacteristics';
import ParametersEvents from './components/ParametersEvents';

const Parameters = () => {
  const [showEventAndCharacteristics, setShowEventAndCharacteristics] = useState(false);
  const [showDocuments, setShowDocuments] = useState(true);

  const handleEventAndCharacteristicsClick = () => {
    setShowEventAndCharacteristics(true);
    setShowDocuments(false);
  };

  const handleBackClick = () => {
    setShowEventAndCharacteristics(false);
    setShowDocuments(true);
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Box p={5}>
        {showDocuments &&
          <ParametersDocuments onEventAndCharacteristicsClick={handleEventAndCharacteristicsClick} />
        }
        {showEventAndCharacteristics &&
          <>
            <Button leftIcon={<IoIosArrowBack />} onClick={handleBackClick}>
              Back
            </Button>
            <ParametersEventAndCharacteristics />
          </>
        }
        {!showEventAndCharacteristics && showDocuments &&
          <ParametersEvents />
        }
      </Box>
    </Box>
  );
};

export default Parameters;
