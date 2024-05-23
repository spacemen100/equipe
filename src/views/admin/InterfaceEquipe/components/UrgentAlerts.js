import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import {
  Alert,
  AlertIcon,
  Box,
  Text,
  Stack,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react";
import { supabase } from './../../../../supabaseClient';
import { useEvent } from '../../../../EventContext';
import { useTeam } from './../TeamContext';

const UrgentAlerts = () => {
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [responseText, setResponseText] = useState("");
  const { selectedEventId } = useEvent(); // Get selectedEventId from context
  const { selectedTeam } = useTeam(); // Access the selected team from the context

  useEffect(() => {
    // Function to fetch urgent alerts
    const fetchUrgentAlerts = async () => {
      try {
        let query = supabase.from('vianney_alertes_specifiques').select("*").order('created_at', { ascending: false }).limit(5);

        // Filter alerts based on the selected event ID
        if (selectedEventId) {
          query = query.eq('event_id', selectedEventId);
        }

        const { data: alertsData, error: alertsError } = await query;

        if (alertsError) {
          throw alertsError;
        }

        // Fetch team names corresponding to teams_id
        const teamIds = alertsData.map(alert => alert.teams_id);
        const { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('id, name_of_the_team').in('id', teamIds);

        if (teamsError) {
          throw teamsError;
        }

        // Create a map of team id to team name
        const teamNameMap = {};
        teamsData.forEach(team => {
          teamNameMap[team.id] = team.name_of_the_team;
        });

        // Combine alert data with team names
        const enrichedAlertsData = alertsData.map(alert => ({
          ...alert,
          team_name: teamNameMap[alert.teams_id]
        }));

        // Filter alerts based on the selected team
        const filteredAlerts = selectedTeam ? enrichedAlertsData.filter(alert => alert.team_name === selectedTeam) : enrichedAlertsData;

        setUrgentAlerts(filteredAlerts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching urgent alerts:", error.message);
      }
    };

    // Call the fetch function initially
    fetchUrgentAlerts();

    // Set up interval to fetch new alerts every minute
    const interval = setInterval(fetchUrgentAlerts, 10000); // 10000 milliseconds = 1 minute

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, [selectedEventId, selectedTeam]);

  
  const handleToggleReadStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('vianney_alertes_specifiques')
        .update({ read_or_not: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the read_or_not status locally
      setUrgentAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === id ? { ...alert, read_or_not: !currentStatus } : alert
        )
      );

      if (!currentStatus) {
        // If the alert is marked as read, show the response form
        setSelectedAlertId(id);
        setShowResponseForm(true);
      }
    } catch (error) {
      console.error("Error toggling read status:", error.message);
    }
  };

  const handleSubmitResponse = async () => {
    try {
      const { error } = await supabase
        .from('vianney_alertes_specifiques')
        .update({ response: responseText })
        .eq('id', selectedAlertId);

      if (error) {
        throw error;
      }

      // Close the response form modal
      setShowResponseForm(false);
      // Reset response text
      setResponseText("");
    } catch (error) {
      console.error("Error submitting response:", error.message);
    }
  };

  return (
    <Box p={1} >
      {isLoading ? (
        <Spinner />
      ) : (
        <Stack spacing={4}>
          {urgentAlerts.map((alert) => (
            // Only render the alert if it's not read
            !alert.read_or_not && (
              <Alert
                key={alert.id}
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="center"
                textAlign="left"
                position="relative"
                width="100%"
                px={6}
                py={4}
                pr={14}
                rounded="md"
              >
                <AlertIcon />
                <Stack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    {alert.text_alert}
                  </Text>
                  <Button
                    onClick={() =>
                      handleToggleReadStatus(alert.id, alert.read_or_not)
                    }
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                  >
                    Non lu (cliquez pour faire disparaître)
                  </Button>
                  <Text fontSize="sm" color="gray.500">
                  Créé le  {format(new Date(alert.created_at), "dd/MM/yyyy à HH:mm")} pour {alert.team_name}
                </Text>
                </Stack>
              </Alert>
            )
          ))}
        </Stack>
      )}
      <Modal isOpen={showResponseForm} onClose={() => setShowResponseForm(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Entrez la réponse</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Réponse</FormLabel>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Entrez votre réponse ici..."
                size="lg"
              />
              <FormHelperText>Entrez votre réponse à cette alerte urgente.</FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitResponse}>
              Soumettre
            </Button>
            <Button onClick={() => setShowResponseForm(false)}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UrgentAlerts;