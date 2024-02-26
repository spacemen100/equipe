import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import frLocale from '@fullcalendar/core/locales/fr'; // Import the French locale

const MyCalendar = () => {
  const events = [
    { title: 'Team A Meeting', start: '2023-11-29T10:00:00', end: '2023-11-29T12:00:00', resourceId: 'teamA' },
    { title: 'Team B Workshop', start: '2023-11-29T13:00:00', end: '2023-11-29T15:00:00', resourceId: 'teamB' },
    { title: 'Team C Discussion', start: '2023-11-29T16:00:00', end: '2023-11-29T17:00:00', resourceId: 'teamC' },
    // More events
  ];

  const resources = [
    { id: 'teamA', title: 'Equipe A' },
    { id: 'teamB', title: 'Equipe B' },
    { id: 'teamC', title: 'Equipe C' },
    // More resources (teams)
  ];
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Card
      direction='column'
      w='100%'
      px='0px'
      overflowX={{ sm: "scroll", lg: "hidden" }}>
      <Flex px='25px' justify='space-between' mb='20px' align='center'>
        <Text
          color={textColor}
          fontSize='22px'
          fontWeight='700'
          lineHeight='100%'>
          Emploi du temps
        </Text>
        <Menu />
      </Flex>
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin]}
          initialView="resourceTimelineDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,resourceTimelineDay'
          }}
          events={events}
          resources={resources}
          locale={frLocale} // Set the locale to French
          eventClick={(info) => {
            // Event click handling
            alert(`Événement : ${info.event.title}`); // Translated alert message
          }}
        />
      </Box >
    </Card>
  );
};

export default MyCalendar;
