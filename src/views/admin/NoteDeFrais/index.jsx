// views/admin/NoteDeFraisComponent.jsx
import React from 'react';
import { Box} from '@chakra-ui/react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseReportContainer from './components/etapes/ExpenseReportContainer';

const NoteDeFraisComponent = () => {
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <ExpenseForm/>
      <ExpenseList/>
      <ExpenseReportContainer/>
    </Box>
  );
};

export default NoteDeFraisComponent;