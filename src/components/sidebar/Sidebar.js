import React from "react";
import PropTypes from "prop-types";
import { Box, Flex, Drawer, DrawerBody, Icon, useColorModeValue, DrawerOverlay, useDisclosure, DrawerContent, DrawerCloseButton } from "@chakra-ui/react";
import Content from "components/sidebar/components/Content";
import { renderThumb, renderTrack, renderView } from "components/scrollbar/Scrollbar";
import { Scrollbars } from "react-custom-scrollbars-2";
import { IoMenuOutline } from "react-icons/io5";

function Sidebar(props) {
  const { routes } = props;

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "unset");
  let sidebarBg = useColorModeValue("white", "navy.800");
  let sidebarMargins = "0px";

  // Filtrer les routes pour masquer les éléments spécifiques
  const filteredRoutes = routes.filter(
    route =>
      route.name !== "Carte zoomée" &&
      route.name !== "Matériel" &&
      route.name !== "Documentss" &&
      route.name !== "Rapport d'incident" &&
      route.name !== "Fiche Bilan SUAP" &&
      route.name !== "Note de frais" &&
      route.name !== "Scanner QR Code"
  );

  return (
    <Box display={{ sm: "none", xl: "block" }} w="100%" position="fixed" minH="100%">
      <Box bg={sidebarBg} transition={variantChange} w="300px" h="100vh" m={sidebarMargins} minH="100%" overflowX="hidden" boxShadow={shadow}>
        <Scrollbars autoHide renderTrackVertical={renderTrack} renderThumbVertical={renderThumb} renderView={renderView}>
          <Content routes={filteredRoutes} />
        </Scrollbars>
      </Box>
    </Box>
  );
}

export function SidebarResponsive(props) {
  let menuColor = useColorModeValue("gray.400", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const { routes } = props;

  // Filtrer les routes pour masquer les éléments spécifiques (même logique que Sidebar)
  const filteredRoutes = routes.filter(
    route =>
      route.name !== "Carte zoomée" &&
      route.name !== "Matériel" &&
      route.name !== "Documentss" &&
      route.name !== "Rapport d'incident" &&
      route.name !== "Fiche Bilan SUAP" &&
      route.name !== "Note de frais" &&
      route.name !== "Scanner QR Code"
  );

  return (
    <Flex display={{ sm: "flex", xl: "none" }} alignItems="center">
      <Flex ref={btnRef} w="max-content" h="max-content" onClick={onOpen}>
        <Icon as={IoMenuOutline} color={menuColor} my="auto" w="20px" h="20px" me="10px" _hover={{ cursor: "pointer" }} />
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose} placement={document.documentElement.dir === "rtl" ? "right" : "left"} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent w="285px" maxW="285px" bg="#465f8b">
          <DrawerCloseButton zIndex="3" onClose={onClose} _focus={{ boxShadow: "none" }} _hover={{ boxShadow: "none" }} />
          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Scrollbars autoHide renderTrackVertical={renderTrack} renderThumbVertical={renderThumb} renderView={renderView}>
              <Content routes={filteredRoutes} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
};

export default Sidebar;
