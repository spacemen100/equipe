import React from 'react';
import { Box, SimpleGrid, Text, VStack, IconButton } from "@chakra-ui/react";
import { FcSelfie, FcCalendar, FcDocument, FcSupport, FcSettings, FcComments, FcEditImage, FcHighPriority } from "react-icons/fc";
import { FaMapMarked } from "react-icons/fa"; // Import the map icon
import { useHistory } from "react-router-dom";

const Menu = () => {
  const history = useHistory();

  const menuItems = [
    { icon: FcSelfie, label: "Gestion opé", path: "/admin/gestion-operationnelle" },
    { icon: FcCalendar, label: "Emploi du temps", path: "/admin/emploi-du-temps" },
    { icon: FcDocument, label: "Documents", path: "/admin/documents" },
    // { icon: FcConferenceCall, label: "Communication", path: "/admin/communication" }, // Communication item hidden
    { icon: FcSupport, label: "Matériel", path: "/admin/materiels" },
    { icon: FcSettings, label: "Params", path: "/admin/parametres" },
    { icon: FcComments, label: "Chat", path: "/admin/chat" },
    { icon: FcDocument, label: "Rapport incident", path: "/admin/rapport-incident" },
    { icon: FcDocument, label: "Fiche Bilan SUAP", path: "/admin/fiche-bilan-suap" },
    { icon: FcEditImage, label: "Note de frais", path: "/admin/note-de-frais" },
    { icon: FcHighPriority, label: "SOS Alerte Danger", path: "/admin/sos-alerte-danger" },
    { icon: FaMapMarked, label: "Carte", path: "/admin/carte" }, // Added link to Carte
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
