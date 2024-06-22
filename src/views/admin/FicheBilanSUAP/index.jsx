import React from "react";
import { Box } from "@chakra-ui/react";
import FicheBilanSUAP from "./components/FicheBilanSUAP";
import ListFicheBilanSUAP from "./components/ListFicheBilanSUAP";



export default function Settings() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <FicheBilanSUAP/>
        <ListFicheBilanSUAP/>
    </Box>
  );
}