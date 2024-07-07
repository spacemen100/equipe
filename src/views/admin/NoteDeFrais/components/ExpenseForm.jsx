import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Flex,
  Link,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Image
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { v4 as uuidv4 } from 'uuid';
import supabase from './../../../../supabaseClient';
import ExpenseSummaryPDF from './ExpenseSummaryPDF';
import { useTeam } from './../../../../views/admin/InterfaceEquipe/TeamContext';
import { useEvent } from './../../../../EventContext';
import { FaFilePdf } from "react-icons/fa6";

// Custom Accordion Button
const CustomAccordionButton = ({ number, title }) => (
  <HStack width="100%" justifyContent="space-between">
    <HStack>
      <Box as="span" display="inline-block" width="24px" height="24px" bg="gray.100" borderRadius="full" textAlign="center" lineHeight="24px">
        {number}
      </Box>
      <Box flex="1" textAlign="left">
        {title}
      </Box>
    </HStack>
    <Button size="sm" leftIcon={<EditIcon />} variant="outline">
      Modifier
    </Button>
  </HStack>
);

// Step 1: Volunteer Information
const Etape1 = ({ data, setData }) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('notedefrais')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erreur de téléchargement:', uploadError);
      } else {
        setData((prevData) => ({ ...prevData, rib: fileName }));
      }
    }
  };

  const fileUrl = data.rib
    ? `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${data.rib}`
    : '';

  return (
    <Box mt="10" p="6" boxShadow="lg" borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white">
      <Grid templateColumns="repeat(2, 1fr)" gap="4">
        <GridItem>
          <FormControl id="volunteer_last_name" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Nom
            </FormLabel>
            <Input
              value={data.volunteer_last_name || ''}
              onChange={handleChange}
              placeholder="Ex. Richard"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="volunteer_first_name" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Prénom
            </FormLabel>
            <Input
              value={data.volunteer_first_name || ''}
              onChange={handleChange}
              placeholder="Ex. Louis"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="phone_number" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Numéro de téléphone
            </FormLabel>
            <Input
              value={data.phone_number || ''}
              onChange={handleChange}
              placeholder="Ex. 0769094854"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="email" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Adresse mail
            </FormLabel>
            <Input
              value={data.email || ''}
              onChange={handleChange}
              placeholder="Ex. louis.richard@ndc.com"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="address" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Adresse postale
            </FormLabel>
            <Input
              value={data.address || ''}
              onChange={handleChange}
              placeholder="Ex. 3 avenue du général Mangin, 78000 Versailles"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="rib" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1000">
              RIB
            </FormLabel>
            <Box position="relative" height="100px">
              <Input type="file" opacity="0" position="absolute" top="0" left="0" height="100%" width="100%" zIndex="2" onChange={handleFileChange} />
              <Box position="absolute" top="0" left="0" height="100%" width="100%" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" zIndex="1">
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
            {fileUrl && <Image src={fileUrl} alt="RIB Preview" mt="4" boxSize="200px" objectFit="cover" borderRadius="md" />}
          </FormControl>
        </GridItem>
        {/* Hidden team_id input */}
        <Input type="hidden" id="team_id" value={data.team_id || ''} onChange={handleChange} />
      </Grid>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" type="button">
          Suivant
        </Button>
      </Box>
    </Box>
  );
};


// Step 2: Vehicle Information
const Etape2 = ({ data, setData }) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('notedefrais')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
      } else {
        setData((prevData) => ({ ...prevData, [field]: fileName }));
      }
    }
  };

  const getFileUrl = (filename) =>
    filename ? `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${filename}` : '';

  return (
    <Box mt="10" p="6" boxShadow="lg" borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white">
      <Grid templateColumns="repeat(2, 1fr)" gap="4">
        <GridItem colSpan={2}>
          <FormControl id="vehicle_type" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Véhicule personnel
            </FormLabel>
            <Select
              value={data.vehicle_type || ''}
              onChange={handleChange}
              placeholder="Sélectionner un type de véhicule"
              borderColor="gray.300"
              borderRadius="md"
              height="40px"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            >
              <option value="voiture">Voiture</option>
              <option value="camion">Camion</option>
              <option value="moto">Moto</option>
              <option value="scooter">Scooter</option>
              <option value="velo">Vélo</option>
            </Select>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="fiscal_power" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Puissance fiscale (P6 carte grise)
            </FormLabel>
            <Input
              value={data.fiscal_power || ''}
              onChange={handleChange}
              placeholder="6"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="registration" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Immatriculation
            </FormLabel>
            <Input
              value={data.registration || ''}
              onChange={handleChange}
              placeholder="Ex. GD-271-NR"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="brand" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1">
              Marque
            </FormLabel>
            <Input
              value={data.brand || ''}
              onChange={handleChange}
              placeholder="Ex. Peugeot"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="departure_odometer" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1000">
              Compteur de kilomètres départ
            </FormLabel>
            <Box position="relative" height="100px">
              <Input type="file" opacity="0" position="absolute" top="0" left="0" height="100%" width="100%" zIndex="2" onChange={(e) => handleFileChange(e, 'departure_odometer')} />
              <Box position="absolute" top="0" left="0" height="100%" width="100%" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" zIndex="1">
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
            {data.departure_odometer && <Image src={getFileUrl(data.departure_odometer)} alt="Departure Odometer Preview" mt="4" boxSize="200px" objectFit="cover" borderRadius="md" />}
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="return_odometer" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1000">
              Compteur de kilomètres retour
            </FormLabel>
            <Box position="relative" height="100px">
              <Input type="file" opacity="0" position="absolute" top="0" left="0" height="100%" width="100%" zIndex="2" onChange={(e) => handleFileChange(e, 'return_odometer')} />
              <Box position="absolute" top="0" left="0" height="100%" width="100%" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" zIndex="1">
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
            {data.return_odometer && <Image src={getFileUrl(data.return_odometer)} alt="Return Odometer Preview" mt="4" boxSize="200px" objectFit="cover" borderRadius="md" />}
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="carte_grise" position="relative" mt="6">
            <FormLabel position="absolute" top="-0.6rem" left="1rem" bg="white" px="0.25rem" fontSize="xs" fontWeight="bold" zIndex="1000">
              Photo de la carte grise
            </FormLabel>
            <Box position="relative" height="100px">
              <Input type="file" opacity="0" position="absolute" top="0" left="0" height="100%" width="100%" zIndex="2" onChange={(e) => handleFileChange(e, 'carte_grise')} />
              <Box position="absolute" top="0" left="0" height="100%" width="100%" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center" zIndex="1">
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
            {data.carte_grise && <Image src={getFileUrl(data.carte_grise)} alt="Carte Grise Preview" mt="4" boxSize="200px" objectFit="cover" borderRadius="md" />}
          </FormControl>
        </GridItem>
      </Grid>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" type="button">
          Suivant
        </Button>
      </Box>
    </Box>
  );
};

// Step 3: Trip Information
const Etape3 = ({ trips, setTrips }) => {
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
    <Box mt="10" p="6" boxShadow="lg" borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white">
      {trips.map((trip, index) => (
        <Flex key={index} justifyContent="space-between" alignItems="center" mb="4">
          <Text fontWeight="bold">{trip.name}</Text>
          <Text color="green.500">{trip.distance} KM</Text>
          <Button size="sm" type="button" onClick={() => handleEditTrip(index)}>Modifier</Button>
        </Flex>
      ))}

      <Flex alignItems="center" mt="6">
        <Icon as={AddIcon} color="blue.500" mr="2" />
        <Link color="blue.500" href="#" onClick={(e) => { e.preventDefault(); onOpen(); }}>
          Ajouter un trajet
        </Link>
      </Flex>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" type="button">
          Suivant
        </Button>
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
};

// Step 4: Expense Information
const Etape4 = ({ expenses, setExpenses }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCost, setNewExpenseCost] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpenseFile, setNewExpenseFile] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewExpenseFile(file);
    }
  };

  const handleAddExpense = async () => {
    let fileName = null;

    if (newExpenseFile) {
      const fileExt = newExpenseFile.name.split('.').pop();
      fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('notedefrais')
        .upload(filePath, newExpenseFile);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
      }
    }

    if (editingExpense !== null) {
      const updatedExpenses = expenses.map((expense, index) =>
        index === editingExpense ? { name: newExpenseName, cost: parseFloat(newExpenseCost), fileName } : expense
      );
      setExpenses(updatedExpenses);
    } else {
      setExpenses([...expenses, { name: newExpenseName, cost: parseFloat(newExpenseCost), fileName }]);
    }
    setNewExpenseName('');
    setNewExpenseCost('');
    setNewExpenseFile(null);
    setEditingExpense(null);
    onClose();
  };

  const handleEditExpense = (index) => {
    setNewExpenseName(expenses[index].name);
    setNewExpenseCost(expenses[index].cost);
    setEditingExpense(index);
    onOpen();
  };

  return (
    <Box mt="10" p="6" boxShadow="lg" borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="white">
      {expenses.map((expense, index) => (
        <Flex key={index} justifyContent="space-between" alignItems="center" mb="4">
          <Text fontWeight="bold">{expense.name}</Text>
          <Text color="green.500">{expense.cost.toFixed(2)} €</Text>
          {expense.fileName && (
            <Image src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${expense.fileName}`} alt="Expense File Preview" mt="4" boxSize="200px" objectFit="cover" borderRadius="md" />
          )}
          <Button size="sm" type="button" onClick={() => handleEditExpense(index)}>Modifier</Button>
        </Flex>
      ))}

      <Flex alignItems="center" mt="6">
        <Icon as={AddIcon} color="blue.500" mr="2" />
        <Link color="blue.500" href="#" onClick={(e) => { e.preventDefault(); onOpen(); }}>
          Ajouter une dépense
        </Link>
      </Flex>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" type="button">
          Suivant
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingExpense !== null ? 'Modifier la dépense' : 'Ajouter une nouvelle dépense'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="newExpenseName" mb="4">
              <FormLabel>Nom de la dépense</FormLabel>
              <Input
                placeholder="Ex. Péage Paris-Lyon"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
              />
            </FormControl>
            <FormControl id="newExpenseCost">
              <FormLabel>Coût (€)</FormLabel>
              <Input
                placeholder="Ex. 50.00"
                value={newExpenseCost}
                onChange={(e) => setNewExpenseCost(e.target.value)}
              />
            </FormControl>
            <FormControl id="newExpenseFile" mt="4">
              <FormLabel>Fichier</FormLabel>
              <Input type="file" onChange={handleFileChange} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr="3" onClick={handleAddExpense}>
              {editingExpense !== null ? 'Modifier' : 'Ajouter'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ExpenseForm = () => {
  const { selectedEventId } = useEvent();
  const { selectedTeam, teamUUID } = useTeam(); // Assume useTeam provides teamUUID
  const [data, setData] = useState({
    volunteer_last_name: '',
    volunteer_first_name: '',
    phone_number: '',
    email: '',
    address: '',
    rib: '',
    donation_option: '',
    departure_odometer: '',
    return_odometer: '',
    carte_grise: '',
    event_id: selectedEventId || null,
    team_id: teamUUID || null, // Set team_id here
  });
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showDownloadLink, setShowDownloadLink] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (selectedEventId) {
      setData(prevData => ({ ...prevData, event_id: selectedEventId }));
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (teamUUID) {
      setData(prevData => ({ ...prevData, team_id: teamUUID }));
    }
  }, [teamUUID]);

  const handleSubmit = async () => {
    const formattedData = {
      id: uuidv4(),
      ...data,
      trips: JSON.stringify(trips),
      expenses: JSON.stringify(expenses),
      total: expenses.reduce((acc, expense) => acc + (expense.cost || 0), 0) + trips.reduce((acc, trip) => acc + (trip.distance || 0) * 0.515, 0),
    };

    const { error } = await supabase
      .from('vianney_expenses_reimbursement')
      .insert([formattedData]);

    if (error) {
      toast({
        title: "Erreur de soumission.",
        description: `Erreur: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Fetch the inserted data from the database
      const { data: insertedData, error: fetchError } = await supabase
        .from('vianney_expenses_reimbursement')
        .select('*')
        .eq('id', formattedData.id)
        .single();

      if (fetchError) {
        toast({
          title: "Erreur de récupération des données.",
          description: `Erreur: ${fetchError.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Soumission réussie.",
          description: "Vos données ont été soumises avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Optionally, clear the form after successful submission
        setData({
          volunteer_last_name: '',
          volunteer_first_name: '',
          phone_number: '',
          email: '',
          address: '',
          rib: '',
          donation_option: '',
          departure_odometer: '',
          return_odometer: '',
          carte_grise: '',
          event_id: null,
          team_id: null
        });
        setTrips([]);
        setExpenses([]);
        setShowDownloadLink(true);
        setData(insertedData);
        setTrips(JSON.parse(insertedData.trips));
        setExpenses(JSON.parse(insertedData.expenses));
      }
    }
  };

  return (
    <>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton as={Box}>
              <CustomAccordionButton number="1" title="Identité du bénévole" />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Etape1 data={data} setData={setData} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton as={Box}>
              <CustomAccordionButton number="2" title="Véhicule utilisé" />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Etape2 data={data} setData={setData} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton as={Box}>
              <CustomAccordionButton number="3" title="Remboursement des frais kilométriques" />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Etape3 trips={trips} setTrips={setTrips} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton as={Box}>
              <CustomAccordionButton number="4" title="Remboursement de frais" />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Etape4 expenses={expenses} setExpenses={setExpenses} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton as={Box}>
              <CustomAccordionButton number="5" title="Récapitulatif" />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <HStack justifyContent="center" spacing={4}>
              <Button colorScheme="blue" onClick={handleSubmit} height="50px">
                Soumettre
              </Button>
              {showDownloadLink && (
                <PDFDownloadLink
                  document={<ExpenseSummaryPDF data={data} trips={trips} expenses={expenses} />}
                  fileName="note_de_frais.pdf"
                >
                  {({ loading }) => (
                    <Button
                      leftIcon={<FaFilePdf />}
                      colorScheme="red"
                      variant="solid"
                      size="lg"
                      height="50px"
                    >
                      {loading ? 'Préparation du PDF...' : 'Télécharger le PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default ExpenseForm;
