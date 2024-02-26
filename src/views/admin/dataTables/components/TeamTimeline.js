import React, { useState, useEffect } from 'react';
import {
  Box, Text, Flex, Card, useColorModeValue, Select, ChakraProvider, useToast, Tooltip, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Input, Stack
} from '@chakra-ui/react';
import { FcPlus } from "react-icons/fc";
import 'react-calendar-timeline/lib/Timeline.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import 'moment/locale/fr'; // Import French locale
import { createClient } from '@supabase/supabase-js';
import './CalendarStyles.css';
import Menu from "components/menu/MainMenuTeamTimeline";
import AddActionForm from './AddActionForm';
import Timeline from 'react-calendar-timeline';


const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set moment to French locale
moment.locale('fr');

function TeamTimeline() {
  const [events, setEvents] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const onClose = () => setIsAlertOpen(false);
  const cancelRef = React.useRef();
  const toast = useToast();
  const [updatedEventName, setUpdatedEventName] = useState('');
  const [updatedEventStart, setUpdatedEventStart] = useState('');
  const [updatedEventEnd, setUpdatedEventEnd] = useState('');
  const [teams, setTeams] = useState([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [visibleTimeStart, setVisibleTimeStart] = useState(moment().add(-12, 'hour').valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(moment().add(12, 'hour').valueOf());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineView, setTimelineView] = useState('day');
  const timelineMaxWidth = '800px';
  const [enableScroll, setEnableScroll] = useState(false);
  const handleMoveBackward = () => {
    const moveBy = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart - moveBy);
    setVisibleTimeEnd(visibleTimeEnd - moveBy);
  };

  const handleMoveForward = () => {
    const moveBy = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart + moveBy);
    setVisibleTimeEnd(visibleTimeEnd + moveBy);
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun événement pour cette période',
    errorEventSelect: 'Erreur lors de la sélection de l\'événement',
    errorEventUpdate: 'Erreur lors de la mise à jour de l\'événement',
    errorEventDelete: 'Erreur lors de la suppression de l\'événement',
    errorMissingEventId: 'Aucun événement sélectionné ou identifiant de l\'événement manquant',
    successEventDelete: 'Événement supprimé avec succès',
    successEventUpdate: 'Événement mis à jour avec succès',
    selectEventToModify: 'Sélectionnez un événement à modifier ou à supprimer.',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.',
    updateEvent: 'Mettre à jour l\'événement',
    deleteEvent: 'Supprimer l\'événement',
    successMessage: 'Action réalisée avec succès',

  };

  useEffect(() => {
    // Update the visibleTimeStart and visibleTimeEnd based on the selected view
    switch (timelineView) {
      case 'hour':
        setVisibleTimeStart(moment().startOf('hour').valueOf());
        setVisibleTimeEnd(moment().endOf('hour').add(1, 'hour').valueOf());
        break;
      case 'day':
        setVisibleTimeStart(moment().startOf('day').valueOf());
        setVisibleTimeEnd(moment().endOf('day').valueOf());
        break;
      case 'week':
        setVisibleTimeStart(moment().startOf('week').valueOf());
        setVisibleTimeEnd(moment().endOf('week').valueOf());
        break;
      case 'month':
        setVisibleTimeStart(moment().startOf('month').valueOf());
        setVisibleTimeEnd(moment().endOf('month').valueOf());
        break;
      default:
        setVisibleTimeStart(moment().startOf('day').valueOf());
        setVisibleTimeEnd(moment().endOf('day').valueOf());
    }
  }, [timelineView]);

  useEffect(() => {
    // Function to fetch teams and events from Supabase
    const fetchTeamsAndEvents = async () => {
      try {
        let { data: teamsData, error: teamsError } = await supabase.from('vianney_teams').select('*');
        if (teamsError) throw teamsError;

        let { data: eventsData, error: eventsError } = await supabase.from('vianney_actions').select(`
          id,
          team_to_which_its_attached,
          starting_date,
          ending_date,
          action_name,
          color: team_to_which_its_attached (color)
        `);
        if (eventsError) throw eventsError;

        setTeams(teamsData);
        setEvents(eventsData.map(event => ({
          ...event,
          group: event.team_to_which_its_attached,
          start_time: moment(event.starting_date),
          end_time: moment(event.ending_date)
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ /* ... */ });
      }
    };

    fetchTeamsAndEvents();
  }, [toast]);

  const groups = teams.map(team => ({
    id: team.id,
    title: team.name_of_the_team,
    color: team.color
  }));

  const items = events.map(event => ({
    id: event.id,
    group: event.resourceId,
    title: event.titel,
    start_time: moment(event.start),
    end_time: moment(event.end),
    itemProps: {
      style: {
        backgroundColor: event.color || 'lightgrey',
        color: 'white'
      }
    }
  }));

  const handleEventSelect = (itemId) => {
    const selected = items.find((item) => item.id === itemId);
    setSelectedEvent(selected);
    setIsAlertOpen(true);
    setUpdatedEventName(selected.title);
    setUpdatedEventStart(selected.start_time.format('YYYY-MM-DDTHH:mm'));
    setUpdatedEventEnd(selected.end_time.format('YYYY-MM-DDTHH:mm'));
  };


  const deleteEvent = async () => {
    console.log('Selected event on delete:', selectedEvent); // Log the event when attempting to delete

    if (!selectedEvent || typeof selectedEvent.id === 'undefined') {
      toast({
        title: "Error",
        description: "No event selected or event ID is missing.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const { error } = await supabase
      .from('vianney_actions')
      .delete()
      .match({ id: selectedEvent.id });

    if (error) {
      console.log(messages.errorEventDelete); // Log the error message
      toast({
        title: "Erreur lors de la suppression de l'événement",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      console.log(messages.successEventDelete); // Log the success message
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      toast({
        title: "Événement supprimé",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  };

  const handleAddActionClick = () => {
    toast({
      title: "Ajouter une action",
      description: <AddActionForm />,
      status: "info",
      duration: null, // The toast will stay until manually closed
      isClosable: true,
      position: "top", // Center the toast at the top of the screen
    });
  };

  const updateEvent = async () => {
    // Validation can be added here for updated event details
    const { error } = await supabase
      .from('vianney_actions')
      .update({
        action_name: updatedEventName,
        starting_date: updatedEventStart,
        ending_date: updatedEventEnd,
        last_updated: new Date() // update the last updated time
      })
      .match({ id: selectedEvent.id });

    if (error) {
      console.log(messages.errorEventUpdate); // Log the error message
      toast({
        title: "Erreur lors de la mise à jour de l'événement",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      console.log(messages.successEventUpdate); // Log the success message
      setEvents(events.map(event =>
        event.id === selectedEvent.id ? { ...event, titel: updatedEventName, start: new Date(updatedEventStart), end: new Date(updatedEventEnd) } : event
      ));
      toast({
        title: "Événement mis à jour",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase.from('vianney_teams').select('*');
    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
    return data.map(team => ({
      id: team.id,
      titel: team.name_of_the_team,
      color: team.color // Assuming each team has a unique color
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const teamsData = await fetchTeams();
      setTeams(teamsData);

      const { data: eventsData, error } = await supabase
        .from('team_action_view_rendering')
        .select('*');

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const formattedEvents = eventsData.map(action => ({
          id: action.action_id,
          titel: action.action_name,
          start: new Date(action.starting_date),
          end: new Date(action.ending_date),
          resourceId: action.team_id,
          color: teamsData.find(t => t.id === action.team_id)?.color || 'lightgrey'
        }));
        setEvents(formattedEvents);
      }
    };

    fetchData();
  }, []);

  return (
    <Card
      direction='column'
      w='100%'
      px='0px'
      overflowX={{ sm: "scroll", lg: "hidden" }}>
      <Box p={4}>
        <ChakraProvider>
          <Box p={4}>
            <Flex px='25px' justify='space-between' mb='20px' align='center'>
              <Text
                color={textColor}
                fontSize='22px'
                fontWeight='700'
                lineHeight='100%'>
                Chronologie de l'évênement
              </Text>
              <Menu onAllowScrollingToggle={() => setEnableScroll(!enableScroll)} />
              <Tooltip label="Cliquer pour ajouter une action" hasArrow>
                <Box position='absolute' top='15px' right='15px' cursor='pointer'>
                  <FcPlus size="24px" onClick={handleAddActionClick} />
                </Box>
              </Tooltip>
            </Flex>
            <Flex justify='space-between' align='center' mb={4}>
              <Flex align='center'>
                <Button
                  mr={2}
                  onClick={handleMoveBackward}
                  colorScheme="blue"
                  size="sm"
                  _active={{ backgroundColor: 'blue.600' }}
                  leftIcon={<FaArrowLeft />}
                >
                  En arrière
                </Button>
                <Button
                  onClick={handleMoveForward}
                  colorScheme="blue"
                  size="sm"
                  _active={{ backgroundColor: 'blue.600' }}
                  rightIcon={<FaArrowRight />}
                >
                  En avant
                </Button>
              </Flex>

              {/* Select for changing view */}
              <Select
                size="sm" // Make the select smaller
                width="auto" // Adjust width to content
                value={timelineView}
                onChange={(e) => setTimelineView(e.target.value)}
              >
                <option value="hour">Heure</option>
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </Select>
            </Flex>
            <Box
              maxWidth={timelineMaxWidth}
              overflowX="auto"
              style={{ maxHeight: enableScroll ? "150px" : "none" }}
            >
              <Timeline
                groups={groups}
                items={items}
                defaultTimeStart={moment().add(-12, 'minute')}
                defaultTimeEnd={moment().add(12, 'minute')}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onItemClick={(itemId) => handleEventSelect(itemId)}
              />
            </Box>
          </Box>
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Options de l'événement
                </AlertDialogHeader>
                <AlertDialogBody>
                  {selectedEvent ? (
                    <Stack spacing={3}>
                      <Input
                        value={updatedEventName}
                        onChange={(e) => setUpdatedEventName(e.target.value)}
                        placeholder="Nom de l'événement"
                      />
                      <Input
                        type="datetime-local"
                        value={updatedEventStart}
                        onChange={(e) => setUpdatedEventStart(e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={updatedEventEnd}
                        onChange={(e) => setUpdatedEventEnd(e.target.value)}
                      />
                    </Stack>
                  ) : (
                    'Sélectionnez un événement à modifier ou à supprimer.'
                  )}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    Annuler
                  </Button>
                  <Button colorScheme="blue" onClick={updateEvent} ml={3}>
                    Mettre à jour
                  </Button>
                  <Button colorScheme="red" onClick={deleteEvent} ml={3}>
                    Supprimer
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </ChakraProvider>
      </Box>
    </Card>
  );
}

export default TeamTimeline;
