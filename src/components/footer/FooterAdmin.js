/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLinkedin } from "react-icons/fa"; // Import LinkedIn icon

export default function Footer() {
  const textColor = useColorModeValue("gray.400", "white");
  return (
    <Flex
      zIndex='3'
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent='space-between'
      px={{ base: "30px", md: "50px" }}
      pb='30px'>
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}>
        &copy; {1900 + new Date().getYear()} PROTECTO. Tout droit réservé. Fait avec amour par 
        <HStack as="span" spacing="4px" ml="4px">
          <Text as='span' fontWeight='500'>
            Vianney
          </Text>
          <Link href='https://fr.linkedin.com/in/vianney-r-630a1a204' isExternal>
            <FaLinkedin size='16px' />
          </Link>
          <Text as='span' fontWeight='500' ml='4px'>
            et
          </Text>
          <Text as='span' fontWeight='500'>
            Guillaume
          </Text>
          <Link href='https://fr.linkedin.com/in/guillaume-r%C3%A9cipon-baaba685' isExternal>
            <FaLinkedin size='16px' />
          </Link>
        </HStack>
      </Text>
      <List display='flex'>
        <ListItem>
          <Link
            fontWeight='500'
            color={textColor}
            href='https://monpadessai.my.canva.site/eventsecu-votre-solution-s-curit-digitale'>
            Blog
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
