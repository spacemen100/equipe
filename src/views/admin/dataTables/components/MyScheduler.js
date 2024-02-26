import React from 'react';
import FullCalendar from '@fullcalendar/react'; // or any other library
import dayGridPlugin from '@fullcalendar/daygrid';

const MyScheduler = () => {
    const events = [
        // Events for Bob
        { title: 'Bob', daysOfWeek: [ '1', '2', '3', '4', '5', '6' ], startTime: '07:00', endTime: '15:00' },
        // Events for Alice
        { title: 'Alice', daysOfWeek: [ '1', '4' ], startTime: '12:00', endTime: '15:00' },
        // Events for John
        { title: 'John', daysOfWeek: [ '0', '1', '2', '3', '4', '5', '6' ], startTime: '00:00', endTime: '00:30' }
    ];

    return (
        <FullCalendar
            plugins={[ dayGridPlugin ]}
            initialView="dayGridMonth"
            events={events}
        />
    );
};

export default MyScheduler;
