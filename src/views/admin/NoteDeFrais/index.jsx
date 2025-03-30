import React from 'react';
import { Box } from '@chakra-ui/react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import DocumentTabs from '../Factures/components/DocumentTabs';

const NoteDeFraisComponent = () => {
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <DocumentTabs/>
      <ExpenseForm/>
      <ExpenseList/>
    </Box>
  );
};

export default NoteDeFraisComponent;
