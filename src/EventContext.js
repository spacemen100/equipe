import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [selectedEventId, setSelectedEventId] = useState(null);

  const setEventId = (eventId) => {
    setSelectedEventId(eventId);
  };

  return (
    <EventContext.Provider value={{ selectedEventId, setEventId }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  return useContext(EventContext);
};