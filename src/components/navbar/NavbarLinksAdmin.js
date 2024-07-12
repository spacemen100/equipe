import { FcHome } from "react-icons/fc";
import { VscBellDot, VscBell } from "react-icons/vsc";
import { MdSos } from "react-icons/md";
import {
  Flex,
  Image,
  Menu,
  MenuList,
  useColorModeValue,
  IconButton
} from '@chakra-ui/react';
import DropdownMenu from 'components/navbar/searchBar/DropdownMenu';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import routes from 'routes.js';

export default function HeaderLinks(props) {
  const { secondary } = props;
  const history = useHistory();  // Hook useHistory pour accéder à l'historique de navigation

  // Chakra Color Mode
  let menuBg = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  // État pour les notifications
  const [hasNotification, setHasNotification] = useState(true);

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <DropdownMenu
        mb={secondary ? { base: '10px', md: 'unset' } : 'unset'}
        me="10px"
        borderRadius="30px"
      />
      <SidebarResponsive routes={routes} />
      <Menu>
        <MenuList
          boxShadow={shadow}
          p='20px'
          me={{ base: "30px", md: "unset" }}
          borderRadius='20px'
          bg={menuBg}
          border='none'
          mt='22px'
          minW={{ base: "unset" }}
          maxW={{ base: "360px", md: "unset" }}
        >
          <Image src={navImage} borderRadius='16px' mb='28px' />
        </MenuList>
      </Menu>
      <IconButton
        aria-label="Home"
        icon={<FcHome />}
        size="lg"
        variant="ghost"
        onClick={() => history.push('/admin/menu')} // Adjust the path as needed
        ml="10px"
      />
      <Flex alignItems="center">
        <IconButton
          aria-label="Notifications"
          icon={hasNotification ? <VscBellDot /> : <VscBell />}
          size="lg"
          variant="ghost"
          ml="10px"
          onClick={() => setHasNotification(!hasNotification)} // Toggle notification state for demonstration
        />
        {hasNotification && (
          <MdSos 
            style={{ color: 'red', marginLeft: '10px', fontSize: '24px', cursor: 'pointer' }} 
            onClick={() => history.push('/admin/sos-alerte-danger')}
          />
        )}
      </Flex>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
};
