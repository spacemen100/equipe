import React from "react";
import { Box } from "@chakra-ui/react";
import AccidentDetected from "./components/AccidentDetected";
import SOSAlertsView from "./components/SOSAlertsView";
import VideoRecorder from "./components/VideoRecorder";


export default function Settings() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <AccidentDetected/>   
        <SOSAlertsView/>   
        <VideoRecorder/>
    </Box>
  );
}