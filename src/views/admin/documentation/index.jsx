import React from "react";
import { Box } from "@chakra-ui/react";
import PdfUploader from "./components/PdfUploader";

const Index = () => {
  return (
    <Box pt={{ base: "140px", md: "80px", xl: "80px" }}>
      <PdfUploader />
    </Box>
  );
};

export default Index;