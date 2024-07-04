import React, { useState, useEffect } from 'react';
import { supabase } from './../../../../supabaseClient'; // Adjust the import according to your project structure
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { useEvent } from './../../../../EventContext'; // Import the useEvent hook

const SOSAlertsView = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const { selectedEventId } = useEvent(); // Get the selected event ID from the context

  useEffect(() => {
    if (selectedEventId) {
      fetchAlerts(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchAlerts = async (eventId) => {
    const { data, error } = await supabase
      .from('vianney_sos_alerts')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts(data);
    }
  };

  return (
    <VStack spacing={8} width="100%" p={4}>
      <Heading as="h1" size="xl">
        SOS Alerts
      </Heading>
      {selectedEventId ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Team Name</Th>
              <Th>Latitude</Th>
              <Th>Longitude</Th>
              <Th>Created At</Th>
              <Th>Event ID</Th>
              <Th>Recording</Th>
            </Tr>
          </Thead>
          <Tbody>
            {alerts.map((alert) => (
              <Tr key={alert.id}>
                <Td>{alert.team_name}</Td>
                <Td>{alert.latitude}</Td>
                <Td>{alert.longitude}</Td>
                <Td>{new Date(alert.created_at).toLocaleString()}</Td>
                <Td>{alert.event_id}</Td>
                <Td>
                  {alert.url ? (
                    <Button
                      colorScheme="blue"
                      onClick={() => setSelectedUrl(alert.url)}
                    >
                      View Recording
                    </Button>
                  ) : (
                    'No Recording'
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>Select an event to view related SOS alerts</Text>
      )}
      {selectedUrl && (
        <Box width="100%">
          <Heading as="h2" size="lg" mt={8} mb={4}>
            Recording
          </Heading>
          <video controls width="100%">
            <source src={selectedUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <Button mt={4} onClick={() => setSelectedUrl('')}>
            Close
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default SOSAlertsView;
