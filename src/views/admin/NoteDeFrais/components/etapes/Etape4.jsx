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

function Etape4() {
  const [trips, setTrips] = useState([
    { name: 'Péage Tassin-Paris', cost: 40.40 },
    { name: 'Péage Chartres-Tassin', cost: 56.80 }
  ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTripName, setNewTripName] = useState('');
  const [newTripCost, setNewTripCost] = useState('');
  const [editingTrip, setEditingTrip] = useState(null);

  const handleAddTrip = () => {
    if (editingTrip !== null) {
      const updatedTrips = trips.map((trip, index) =>
        index === editingTrip ? { name: newTripName, cost: parseFloat(newTripCost) } : trip
      );
      setTrips(updatedTrips);
    } else {
      setTrips([...trips, { name: newTripName, cost: parseFloat(newTripCost) }]);
    }
    setNewTripName('');
    setNewTripCost('');
    setEditingTrip(null);
    onClose();
  };

  const handleEditTrip = (index) => {
    setNewTripName(trips[index].name);
    setNewTripCost(trips[index].cost);
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
          <Text color="green.500">{trip.cost.toFixed(2)} €</Text>
          <Button size="sm" onClick={() => handleEditTrip(index)}>Modifier</Button>
        </Flex>
      ))}

      <Flex alignItems="center" mt="6">
        <Icon as={AddIcon} color="blue.500" mr="2" />
        <Link color="blue.500" href="#" onClick={onOpen}>
          Ajouter une dépense
        </Link>
      </Flex>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue">Suivant</Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTrip !== null ? 'Modifier la dépense' : 'Ajouter une nouvelle dépense'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="newTripName" mb="4">
              <FormLabel>Nom de la dépense</FormLabel>
              <Input
                placeholder="Ex. Péage Paris-Lyon"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
              />
            </FormControl>
            <FormControl id="newTripCost">
              <FormLabel>Coût (€)</FormLabel>
              <Input
                placeholder="Ex. 50.00"
                value={newTripCost}
                onChange={(e) => setNewTripCost(e.target.value)}
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

export default Etape4;