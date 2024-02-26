import React from "react";
import { Icon, Flex, Text, Menu, MenuItem, MenuButton, MenuList, useDisclosure, useColorModeValue } from "@chakra-ui/react";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { FcAutomatic } from "react-icons/fc";

export default function Banner(props) {
  const { onAllowScrollingToggle, ...rest } = props;

  const iconColor = useColorModeValue("brand.500", "white");
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.50" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.100" }
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <MenuButton
        align='center'
        justifyContent='center'
        bg={bgButton}
        _hover={bgHover}
        _focus={bgFocus}
        _active={bgFocus}
        w='37px'
        h='37px'
        lineHeight='100%'
        onClick={onOpen}
        borderRadius='10px'
        {...rest}>
        <Icon as={MdOutlineMoreHoriz} color={iconColor} w='24px' h='24px' />
      </MenuButton>
      <MenuList
        minW='unset'
        maxW='150px !important'
        border='transparent'
        borderRadius='20px'
        p='15px'>
        <MenuItem
          onClick={() => onAllowScrollingToggle()}
          transition='0.2s linear'
          p='0px'
          borderRadius='8px'
          _hover={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
          _focus={{ bg: "transparent" }}>
          <Flex align='center'>
            <Icon as={FcAutomatic} h='16px' w='16px' me='8px' />
            <Text fontSize='sm' fontWeight='400'>
              Allow Scrolling
            </Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
