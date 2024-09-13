import React from 'react';
import { Box, SimpleGrid, Text, VStack, IconButton } from "@chakra-ui/react";
import { FcMenu, FcCalendar, FcDocument, FcSettings, FcComments, FcHighPriority } from "react-icons/fc";
import { BsGeoAltFill } from "react-icons/bs";
import { FaMapMarked } from "react-icons/fa"; // Import the map icon
import { useHistory } from "react-router-dom";

const Menu = () => {
  const history = useHistory();

  const menuItems = [
    { icon: FcMenu, label: "Menu", path: "/admin/default" },
    { icon: BsGeoAltFill, label: "Géolocalisation", path: "/admin/gestion-operationnelle" },
    { icon: FcCalendar, label: "Emploi du temps", path: "/admin/emploi-du-temps" },
    { icon: FcDocument, label: "Documents", path: "/admin/documents-tabs" },
    { icon: FcComments, label: "Chat", path: "/admin/chat" },
    { icon: FcSettings, label: "Paramètres", path: "/admin/parametres" },
    { icon: FcHighPriority, label: "SOS Alerte Danger", path: "/admin/sos-alerte-danger" },
    { icon: FaMapMarked, label: "Carte", path: "/admin/carte" }, // Only "Carte" remains, not "Carte zoomée"
  ];  

  return (
    <Box pt={{ base: '180px', md: '80px', xl: '80px' }} textAlign="center">
      <SimpleGrid columns={[3, null, 2]} spacing={10}>
        {menuItems.map((item, index) => (
          <Box
            key={index}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={5}
            bg="#465f8b"
            _hover={{ bg: "#3b4c6e" }}
            onClick={() => history.push(item.path)}
            cursor="pointer"
            boxShadow="md"
          >
            <VStack spacing={4}>
              <IconButton
                icon={<item.icon size="60px" />}
                size="lg"
                isRound
                aria-label={item.label}
                variant="ghost"
                colorScheme="whiteAlpha"
              />
              <Text fontSize="lg" fontWeight="bold" color="white">{item.label}</Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Menu;
