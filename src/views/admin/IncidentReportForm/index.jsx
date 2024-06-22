import React from 'react';
import { Box} from '@chakra-ui/react';
import IncidentReportForm from './components/IncidentReportForm';

const NoteDeFraisComponent = () => {
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
        <IncidentReportForm/>
    </Box>
  );
};

export default NoteDeFraisComponent;