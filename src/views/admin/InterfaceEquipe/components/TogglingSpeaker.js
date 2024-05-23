import { Box, IconButton, Icon } from "@chakra-ui/react";
import { RxSpeakerLoud, RxSpeakerModerate, RxSpeakerOff } from "react-icons/rx";
import { useState } from "react";

const TogglingSpeaker = () => {
  const [volume, setVolume] = useState("loud"); // Initial volume state

  const toggleVolume = () => {
    if (volume === "loud") {
      setVolume("moderate");
    } else if (volume === "moderate") {
      setVolume("off");
    } else {
      setVolume("loud");
    }
  };

  const getIcon = () => {
    if (volume === "loud") {
      return <Icon as={RxSpeakerLoud} boxSize={6} color="green.500" />;
    } else if (volume === "moderate") {
      return <Icon as={RxSpeakerModerate} boxSize={6} color="yellow.500" />;
    } else {
      return <Icon as={RxSpeakerOff} boxSize={6} color="red.500" />;
    }
  };

  return (
    <Box>
      <IconButton
        variant="unstyled"
        aria-label="Toggle Volume"
        onClick={toggleVolume}
      >
        {getIcon()}
      </IconButton>
    </Box>
  );
};

export default TogglingSpeaker;