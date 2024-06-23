import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ExpenseReport from './ExpenseReport';
import supabase from './../../../../../supabaseClient';
import { Button, Spinner, Flex } from '@chakra-ui/react';

const ExpenseReportContainer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let { data, error } = await supabase
        .from('vianney_expenses_reimbursement')
        .select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        // Assuming fetching a single entry, adjust as needed
        setData(data[0]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <div>
      {data && (
        <PDFDownloadLink
          document={<ExpenseReport data={data} />}
          fileName="expense_report.pdf"
        >
          {({ loading }) =>
            loading ? <Button isLoading>Generating PDF...</Button> : <Button>Download PDF</Button>
          }
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default ExpenseReportContainer;