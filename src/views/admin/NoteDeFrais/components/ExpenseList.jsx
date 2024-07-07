import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  Image,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import supabase from './../../../../supabaseClient';
import { useTeam } from './../../InterfaceEquipe/TeamContext'; // Assuming you have a TeamContext

const ExpenseList = () => {
  const { selectedTeam } = useTeam(); // Get the selected team from context
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let { data, error } = await supabase
          .from('vianney_expenses_reimbursement')
          .select('*')
          .eq('team_id', selectedTeam.id); // Filter by selected team

        if (error) {
          throw error;
        }

        setExpenses(data);
      } catch (error) {
        toast({
          title: 'Erreur de chargement',
          description: `Erreur: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeam) {
      fetchExpenses();
    }
  }, [selectedTeam, toast]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p="6">
      <Grid templateColumns="repeat(1, 1fr)" gap="6">
        {expenses.map((expense) => (
          <Box
            key={expense.id}
            p="6"
            boxShadow="lg"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            bg="white"
          >
            <Grid templateColumns="repeat(2, 1fr)" gap="4">
              <GridItem>
                <Text fontWeight="bold">Nom:</Text>
                <Text>{expense.volunteer_last_name}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Prénom:</Text>
                <Text>{expense.volunteer_first_name}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Téléphone:</Text>
                <Text>{expense.phone_number}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Email:</Text>
                <Text>{expense.email}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Pôle:</Text>
                <Text>{expense.pole}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Adresse:</Text>
                <Text>{expense.address}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Option de donation:</Text>
                <Text>{expense.donation_option}</Text>
              </GridItem>
              {expense.rib && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">RIB:</Text>
                  <Image
                    src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${expense.rib}`}
                    alt="RIB Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </GridItem>
              )}
              {expense.departure_odometer && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Compteur de kilomètres départ:</Text>
                  <Image
                    src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${expense.departure_odometer}`}
                    alt="Departure Odometer Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </GridItem>
              )}
              {expense.return_odometer && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Compteur de kilomètres retour:</Text>
                  <Image
                    src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${expense.return_odometer}`}
                    alt="Return Odometer Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </GridItem>
              )}
              {expense.carte_grise && (
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Photo de la carte grise:</Text>
                  <Image
                    src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${expense.carte_grise}`}
                    alt="Carte Grise Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </GridItem>
              )}
              <GridItem colSpan={2}>
                <Text fontWeight="bold">Trajets:</Text>
                {expense.trips && JSON.parse(expense.trips).map((trip, index) => (
                  <Box key={index} mb="4">
                    <Text>{trip.name} - {trip.distance} KM</Text>
                  </Box>
                ))}
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold">Dépenses:</Text>
                {expense.expenses && JSON.parse(expense.expenses).map((exp, index) => (
                  <Box key={index} mb="4">
                    <Text>{exp.name} - {exp.cost ? exp.cost.toFixed(2) : 'N/A'} €</Text>
                    {exp.file && (
                      <Image
                        src={`https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${exp.file}`}
                        alt="Expense File Preview"
                        boxSize="200px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    )}
                  </Box>
                ))}
              </GridItem>
            </Grid>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default ExpenseList;
