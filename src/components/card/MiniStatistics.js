import { FcAdvertising } from "react-icons/fc";
import {
  Flex,
  Stat,
  StatNumber,
  StatLabel,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import IconBox from "components/icons/IconBox";
import Card from "components/card/Card.js";
import React from "react";

export default function Default(props) {
  const { event_name, date } = props; // Destructure date from props
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // Function to format the date as desired
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card py='15px'>
      <Flex
        my='auto'
        h='100%'
        align={{ base: "center", xl: "start" }}
        justify={{ base: "center", xl: "center" }}>
          <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={FcAdvertising} color={brandColor} />
              }
            />
        <Stat my='auto' ms="10px">
          
          <StatNumber
            color={textColor}
            fontSize={{
              base: "xl",
            }}>
            {event_name}
          </StatNumber>
          <StatLabel color={textColor} fontSize="md">{formatDate(date)} </StatLabel>
        </Stat>
      </Flex>
    </Card>
  );
}
