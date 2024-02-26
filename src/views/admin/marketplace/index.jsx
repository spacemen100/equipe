import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import MapComponent from "views/admin/marketplace/components/MapComponent";
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators";
import NFT from "components/card/NFT";
import Card from "components/card/Card.js";

import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json";
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators";
import CameraForm from "./components/CameraForm";
import { createClient } from '@supabase/supabase-js';
import UserForm from './components/UserForm';
import VianneyAlertChat from '../dataTables/components/VianneyAlertChat';
import TeamScheduleMadeMySelf from '../dataTables/components/TeamScheduleMadeMySelf';
import TeamTimeline from '../dataTables/components/TeamTimeline';

const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Marketplace() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      const { data, error } = await supabase
        .from('vianney_cameras')
        .select('*');

      if (error) {
        console.log('Error fetching data:', error);
        setCameras([]); // Set cameras to an empty array in case of error
      } else {
        setCameras(data);
      }
    };

    fetchCameras();
  }, []);
  // New state for controlling the visibility of forms
  const [showForms, setShowForms] = useState(false);

  // Toggle function for the button
  const toggleForms = () => {
    setShowForms(!showForms);
  };

  const [maxWidth, setMaxWidth] = useState(null);

  // Function to set maxWidth based on screen size
  const setMaxWidthBasedOnScreen = () => {
    const screenSize = window.innerWidth;
    const newMaxWidth = screenSize / 2.1;
    setMaxWidth(screenSize <= 768 ? '100%' : `${newMaxWidth}px`);
  };

  // Call the function initially and add event listener for window resize
  useEffect(() => {
    setMaxWidthBasedOnScreen();
    window.addEventListener('resize', setMaxWidthBasedOnScreen);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('resize', setMaxWidthBasedOnScreen);
    };
  }, []);

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Grid
        mb='20px'
        gridTemplateColumns={{ xl: "repeat(3, 1fr)", "2xl": "1fr 0.46fr" }}
        gap={{ base: "20px", xl: "20px" }}
        display={{ base: "block", xl: "grid" }}>
        <Flex
          flexDirection='column'
          gridArea={{ xl: "1 / 1 / 2 / 3", "2xl": "1 / 1 / 2 / 2" }}>
          <Box mt="10px" borderRadius="lg" overflow="hidden">
            <MapComponent />
          </Box>
          <Box maxWidth={maxWidth}>
            <Card px='0px' mb='20px'>
              <TeamTimeline />
            </Card>
          </Box>
          <Flex direction='column'>
            <Flex
              mt='45px'
              mb='20px'
              justifyContent='space-between'
              direction={{ base: "column", md: "row" }}
              align={{ base: "start", md: "center" }}>
              <Text color={textColor} fontSize='2xl' ms='24px' fontWeight='700'>
                Les vidéos en direct de l'évênement
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px'>
              {cameras?.map(camera => (
                <NFT
                  key={camera.id}
                  image_url={camera.image_url}
                  name={camera.name}
                  location={camera.location}
                  last_active={camera.last_active}
                  latitude={camera.latitude}
                  longitude={camera.longitude}
                // include other properties from camera if your NFT component uses them
                />

              ))}
            </SimpleGrid>
          </Flex>
          <Button onClick={toggleForms} mt='4' mb='4'>
            {showForms ? 'Cacher le formulaire' : 'Montrer le formulaire'}
          </Button>
          {showForms && (
            <>
              <Box>
                <CameraForm />
              </Box>
              <Box>
                <UserForm />
              </Box>
            </>
          )}
        </Flex>
        <Flex
          flexDirection='column'
          gridArea={{ xl: "1 / 3 / 2 / 4", "2xl": "1 / 2 / 2 / 3" }}>
          <Box maxWidth={maxWidth}>
            <Card px='0px' mb='20px'>
              <TableTopCreators
                tableData={tableDataTopCreators}
                columnsData={tableColumnsTopCreators}
              />
            </Card>
          </Box>
          <Card p='0px'>
            <VianneyAlertChat />
          </Card>
          <Box maxWidth={maxWidth}>
            <Card px='0px' mb='20px'>
              <TeamScheduleMadeMySelf />

            </Card>
          </Box>

        </Flex>
      </Grid>
    </Box >
  );
}
