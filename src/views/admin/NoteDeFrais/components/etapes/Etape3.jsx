import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Link,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

function Etape3() {
  const [trips, setTrips] = useState([
    { name: 'Tassin-Paris', distance: 473 },
    { name: 'Chartres-Tassin', distance: 508 }
  ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTripName, setNewTripName] = useState('');
  const [newTripDistance, setNewTripDistance] = useState('');
  const [editingTrip, setEditingTrip] = useState(null);

  const handleAddTrip = () => {
    if (editingTrip !== null) {
      const updatedTrips = trips.map((trip, index) =>
        index === editingTrip ? { name: newTripName, distance: parseInt(newTripDistance) } : trip
      );
      setTrips(updatedTrips);
    } else {
      setTrips([...trips, { name: newTripName, distance: parseInt(newTripDistance) }]);
    }
    setNewTripName('');
    setNewTripDistance('');
    setEditingTrip(null);
    onClose();
  };

  const handleEditTrip = (index) => {
    setNewTripName(trips[index].name);
    setNewTripDistance(trips[index].distance);
    setEditingTrip(index);
    onOpen();
  };

  return (
    <Box
      mt="10"
      p="6"
      boxShadow="lg"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
    >
      {trips.map((trip, index) => (
        <Flex key={index} justifyContent="space-between" alignItems="center" mb="4">
          <Text fontWeight="bold">{trip.name}</Text>
          <Text color="green.500">{trip.distance} KM</Text>
          <Button size="sm" onClick={() => handleEditTrip(index)}>Modifier</Button>
        </Flex>
      ))}

      <Flex alignItems="center" mt="6">
        <Icon as={AddIcon} color="blue.500" mr="2" />
        <Link color="blue.500" href="#" onClick={onOpen}>
          Ajouter un trajet
        </Link>
      </Flex>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue">Suivant</Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTrip !== null ? 'Modifier le trajet' : 'Ajouter un nouveau trajet'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="newTripName" mb="4">
              <FormLabel>Nom du trajet</FormLabel>
              <Input
                placeholder="Ex. Paris-Lyon"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
              />
            </FormControl>
            <FormControl id="newTripDistance">
              <FormLabel>Distance (KM)</FormLabel>
              <Input
                placeholder="Ex. 500"
                value={newTripDistance}
                onChange={(e) => setNewTripDistance(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr="3" onClick={handleAddTrip}>
              {editingTrip !== null ? 'Modifier' : 'Ajouter'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Etape3;