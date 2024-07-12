// src/views/admin/InterfaceEquipe/TeamContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './../../../supabaseClient';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [selectedTeam, setSelectedTeam] = useState(""); // The selected team
  const [teamData, setTeamData] = useState([]); // To store fetched team data
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamUUID, setTeamUUID] = useState(""); // To store the team UUID

  useEffect(() => {
    async function fetchSelectedTeamDetails() {
      if (!selectedTeam) return; // Do not fetch if no team is selected

      try {
        const { data, error } = await supabase
          .from('vianney_teams')
          .select('id, team_members') // Include 'id' in the select query
          .eq('name_of_the_team', selectedTeam) // Assuming 'name_of_the_team' is what you store in 'selectedTeam'
          .single(); // Assuming you want to fetch a single record

        if (error) throw error;

        // Assume 'id' is the team UUID
        if (data && data.id) {
          setTeamUUID(data.id); // Set the team UUID
        }

        // Assume 'team_members' is stored directly as an array in the fetched data
        if (data && data.team_members) {
          setTeamMembers(data.team_members);
        }
      } catch (error) {
        console.error('Error fetching selected team details:', error);
      }
    }

    fetchSelectedTeamDetails();
  }, [selectedTeam, setTeamMembers, setTeamUUID]); // Add setTeamUUID to the dependencies array

  const value = {
    selectedTeam,
    setSelectedTeam,
    teamData,
    setTeamData,
    teamMembers,
    setTeamMembers,
    teamUUID, // Include teamUUID in the context value
    setTeamUUID,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => useContext(TeamContext);
