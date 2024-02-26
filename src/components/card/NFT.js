import React from "react";
import {
  Box,
  Button,
  Flex,
Icon,
  Image,
  Text,
  useColorModeValue,
  Card
} from "@chakra-ui/react";
import { FcCamera, FcCameraIdentification } from "react-icons/fc";

export default function NFT(props) {
  const { image_url, name, location, last_active, latitude, longitude } = props;
  const [like, setLike] = React.useState(false);
  const textColor = useColorModeValue("navy.700", "white");
  const handleImageError = (e) => {
    console.error("Error loading image: ", e);
    // You can set a fallback image here if necessary
  };

  return (
    <Card p='20px'>
      <Flex direction={{ base: "column" }} justify='center'>
        <Box mb={{ base: "20px", "2xl": "20px" }} position='relative'>
          <Image
            src={image_url}
            w={{ base: "100%", "3xl": "100%" }}
            h={{ base: "100%", "3xl": "100%" }}
            borderRadius='20px'
            onError={handleImageError}
            alt={`Image for ${name}`}
          />
          {/* Like button */}
          <Button
            position='absolute'
            bg='white'
            _hover={{ bg: "whiteAlpha.900" }}
            _active={{ bg: "white" }}
            _focus={{ bg: "white" }}
            p='0px !important'
            top='14px'
            right='14px'
            borderRadius='50%'
            minW='36px'
            h='36px'
            onClick={() => setLike(!like)}>
            <Icon
              as={like ? FcCameraIdentification : FcCamera}
              transition='0.2s linear'
              w='20px'
              h='20px'
              color='brand.500'
            />
          </Button>
        </Box>
        <Flex flexDirection='column' justify='space-between' h='100%'>
          <Flex justify='space-between' mb='auto'>
            <Text
              color={textColor}
              fontSize={{ base: "xl", md: "lg", lg: "lg", xl: "lg", "2xl": "md", "3xl": "lg" }}
              mb='5px'
              fontWeight='bold'>
              {name}
            </Text>
            {/* Location and other details */}
            <Text color='secondaryGray.600' fontSize='sm' fontWeight='400'>
              {location} - Last active: {last_active}
            </Text>
          </Flex>
          {/* Additional details */}
          <Text fontWeight='700' fontSize='sm' color={textColor}>
            Latitude: {latitude}
          </Text>
          <Text fontWeight='700' fontSize='sm' color={textColor}>
            Logitude:{longitude}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
