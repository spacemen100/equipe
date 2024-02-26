import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  VStack,
  HStack,
  Checkbox,
} from '@chakra-ui/react';
// Initialize Supabase client
const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const UserForm = () => {
  const [nameOfTheTeam, setNameOfTheTeam] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [lat, setLat] = useState(45.75799485263588);
  const [lng, setLng] = useState(4.825754111294844);
  const [mission, setMission] = useState('');
  const [typeDeVehicule, setTypeDeVehicule] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [teamMembers, setTeamMembers] = useState([{ 
    id: uuidv4(), // Generate unique ID for the first team member
    familyname: '', 
    firstname: '', 
    mail: '', 
    phone: '', 
    isLeader: false, // Added isLeader property
  }]);
  const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    return `#${randomColor}`;
  };
  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleTeamMemberChange = (index, event) => {
    let values = [...teamMembers];
  
    if (event.target.name === 'isLeader') {
      // Set all isLeader properties to false
      values = values.map(member => ({ ...member, isLeader: false }));
      // Set isLeader to true for the selected member
      values[index][event.target.name] = event.target.checked;
    } else {
      values[index][event.target.name] = event.target.value;
    }
  
    setTeamMembers(values);
  };
  

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { 
      id: uuidv4(), // Generate unique ID for new team member
      familyname: '', 
      firstname: '', 
      mail: '', 
      phone: '' 
    }]);
  };

  // Map events
const LocationMarker = () => {
  const map = useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return lat !== 0 ? (
    <Marker position={[lat, lng]}></Marker>
  ) : null;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const teamColor = generateRandomColor(); // Generate a random color for the team
  const timestamp = new Date().toISOString(); // Generate a timestamp
    if (!profilePhoto) {
      console.error('No profile photo selected');
      return;
    }

    const fileExt = profilePhoto.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    let uploadResponse = await supabase.storage
      .from('users_on_the_ground')
      .upload(fileName, profilePhoto);

    if (uploadResponse.error) {
      console.error('Error uploading file:', uploadResponse.error);
      return;
    }

    const publicURL = `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/users_on_the_ground/${fileName}`;

  // Insert user data into the database
  const { error: insertError } = await supabase
    .from('vianney_teams')
    .insert([{
      id: uuidv4(), // Generate a new UUID for each team
      name_of_the_team: nameOfTheTeam,
      latitude: lat,
      longitude: lng,
      photo_profile_url: publicURL,
      last_active: new Date().toISOString(),
      team_members: teamMembers,
      color: teamColor,
      creation_timestamp: timestamp,
      mission: mission,
        type_de_vehicule: typeDeVehicule,
        immatriculation: immatriculation,
        specialite: specialite,
    }]);

  if (insertError) {
    console.error('Error inserting data:', insertError);
    return;
  }

    alert('User data added successfully');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box id="mapId" h="400px" w="100%">
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </Box>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel htmlFor='team-name'>Nom de l'équipe</FormLabel>
          <Input id='team-name' type="text" placeholder="Nom de l'équipe" value={nameOfTheTeam} onChange={(e) => setNameOfTheTeam(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor='profile-photo'>Photo de profil</FormLabel>
          <Input id='profile-photo' type="file" onChange={handleFileChange} />
        </FormControl>
        <FormControl>
        <FormLabel htmlFor='mission'>Mission</FormLabel>
        <Input
          id='mission'
          type="text"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor='typeDeVehicule'>Type de Véhicule</FormLabel>
        <Input
          id='typeDeVehicule'
          type="text"
          value={typeDeVehicule}
          onChange={(e) => setTypeDeVehicule(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor='immatriculation'>Immatriculation</FormLabel>
        <Input
          id='immatriculation'
          type="text"
          value={immatriculation}
          onChange={(e) => setImmatriculation(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor='specialite'>Spécialité</FormLabel>
        <Input
          id='specialite'
          type="text"
          value={specialite}
          onChange={(e) => setSpecialite(e.target.value)}
        />
      </FormControl>

    {teamMembers.map((teamMember, index) => (
      <HStack key={index} spacing={2}>
        <Input
      type="text"
      name="familyname" // Add this line
      placeholder="Nom de famille"
      value={teamMember.familyname}
      onChange={(e) => handleTeamMemberChange(index, e)}
    />
    <Input
      type="text"
      name="firstname" // Add this line
      placeholder="Prénom"
      value={teamMember.firstname}
      onChange={(e) => handleTeamMemberChange(index, e)}
    />
    <Input
      type="text"
      name="mail" // Add this line
      placeholder="Email"
      value={teamMember.mail}
      onChange={(e) => handleTeamMemberChange(index, e)}
    />
    <Input
      type="text"
      name="phone" // Add this line
      placeholder="Téléphone"
      value={teamMember.phone}
      onChange={(e) => handleTeamMemberChange(index, e)}
    />
        <Checkbox 
          name="isLeader"
          isChecked={teamMember.isLeader}
          onChange={(e) => handleTeamMemberChange(index, e)}
        >
          Leader ?
        </Checkbox>
      </HStack>
    ))}
    

        <Button colorScheme="blue" onClick={handleAddTeamMember}>Ajouter un membre de l'équipe</Button>
      </VStack>

      <Button mt={4} colorScheme="green" type="submit">Ajouter l'utilisateur</Button>
    </form>
  );
};

export default UserForm;
