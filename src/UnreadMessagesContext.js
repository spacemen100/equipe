import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Adjust the import according to your project structure

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
    return useContext(UnreadMessagesContext);
};

export const UnreadMessagesProvider = ({ selectedTeam, children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (selectedTeam) {
            const fetchUnreadMessagesCount = async () => {
                try {
                    console.log(`Fetching unread messages count for team: ${selectedTeam}`);

                    // Fetch total number of messages
                    const { data: totalMessages, error: totalError } = await supabase
                        .from('vianney_chat_messages')
                        .select('id');

                    if (totalError) {
                        console.error('Error fetching total messages:', totalError);
                        return;
                    }

                    console.log(`Total messages fetched: ${totalMessages.length}`);

                    // Fetch number of messages read by the selected team
                    const { data: readMessages, error: readError } = await supabase
                        .from('vianney_chat_messages')
                        .select('id')
                        .contains('read_by_teams', JSON.stringify([selectedTeam]));

                    if (readError) {
                        console.error('Error fetching read messages:', readError.message, readError.details);
                        return;
                    }

                    console.log(`Messages read by team "${selectedTeam}": ${readMessages.length}`);

                    // Calculate unread count
                    const unreadMessagesCount = totalMessages.length - readMessages.length;
                    console.log(`Unread messages count: ${unreadMessagesCount}`);

                    setUnreadCount(unreadMessagesCount);
                } catch (error) {
                    console.error('Unexpected error fetching unread messages:', error);
                }
            };

            // Initial fetch
            fetchUnreadMessagesCount();

            // Polling every 60 seconds
            const intervalId = setInterval(fetchUnreadMessagesCount, 20000);

            // Cleanup interval on component unmount or when selectedTeam changes
            return () => clearInterval(intervalId);
        }
    }, [selectedTeam]);

    return (
        <UnreadMessagesContext.Provider value={unreadCount}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};
