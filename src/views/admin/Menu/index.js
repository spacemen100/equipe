import React from 'react';
import { Box, SimpleGrid, Text, VStack, IconButton } from "@chakra-ui/react";
import { FcSelfie, FcCalendar, FcDocument, FcConferenceCall, FcPackage, FcSettings } from "react-icons/fc";
import { useHistory } from "react-router-dom";

const Menu = () => {
  const history = useHistory();

  const menuItems = [
    { icon: FcSelfie, label: "Gestion opérationnelle", path: "/admin/gestion-operationnelle" },
    { icon: FcCalendar, label: "Emploi du temps", path: "/admin/emploi-du-temps" },
    { icon: FcDocument, label: "Documents", path: "/admin/documents" },
    { icon: FcConferenceCall, label: "Communication", path: "/admin/communication" },
    { icon: FcPackage, label: "Matériel", path: "/admin/materiel" },
    { icon: FcSettings, label: "Paramètres", path: "/admin/parametres" },
  ];

  return (
    <Box p={5}>
      <Text fontSize="2xl" mb={4}>Menu</Text>
      <SimpleGrid columns={2} spacing={10}>
        {menuItems.map((item, index) => (
          <VStack key={index} onClick={() => history.push(item.path)} cursor="pointer">
            <IconButton
              icon={<item.icon size="40px" />}
              size="lg"
              isRound
              aria-label={item.label}
            />
            <Text>{item.label}</Text>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Menu;
