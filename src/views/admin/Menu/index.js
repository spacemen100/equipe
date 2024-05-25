import React from 'react';
import { Box, SimpleGrid, Text, VStack, IconButton } from "@chakra-ui/react";
import { FcSelfie, FcCalendar, FcDocument, FcConferenceCall, FcSupport, FcSettings } from "react-icons/fc";
import { useHistory } from "react-router-dom";

const Menu = () => {
  const history = useHistory();

  const menuItems = [
    { icon: FcSelfie, label: "Gestion opérationnelle", path: "/admin/gestion-operationnelle" },
    { icon: FcCalendar, label: "Emploi du temps", path: "/admin/emploi-du-temps" },
    { icon: FcDocument, label: "Documents", path: "/admin/documents" },
    { icon: FcConferenceCall, label: "Communication", path: "/admin/communication" },
    { icon: FcSupport, label: "Matériel", path: "/admin/materiel" },
    { icon: FcSettings, label: "Paramètres", path: "/admin/parametres" },
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
