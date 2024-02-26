import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export default function Banner() {
  return (
    <Flex
      direction="column"
      bgGradient="linear(to-r, blue.200, blue.500, blue.800)"
      py={{ base: "2", md: "3" }}
      px={{ base: "8", md: "16" }}
      borderRadius="xl">
      <Text
        fontSize={{ base: "md", md: "lg", lg: "xl", xl: "2xl" }}
        color="white"
        mb="1"
        maxW={{
          base: "100%",
          md: "64%",
          lg: "46%",
          xl: "70%",
          "2xl": "50%",
          "3xl": "42%",
        }}
        fontWeight="bold"
        lineHeight="shorter">
        Carte de l'évênement
      </Text>
      <Text
        fontSize="md"
        color="#E3DAFF"
        maxW={{
          base: "100%",
          md: "64%",
          lg: "40%",
          xl: "56%",
          "2xl": "46%",
          "3xl": "34%",
        }}
        fontWeight="medium"
        mb="2"
        lineHeight="normal">
        Zoomez pour voir les détails
      </Text>
    </Flex>
  );
}
