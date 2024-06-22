import React, { useEffect, useState } from 'react';
import { Box, Heading, Stack, Spinner, Alert, AlertIcon, AlertTitle } from "@chakra-ui/react";
import { supabase } from './../../../../supabaseClient';
import RenderFicheBilanSUAP from './RenderFicheBilanSUAP';

const ListFicheBilanSUAP = () => {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiches = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_fiche_bilan_suap')
          .select('*');

        if (error) {
          throw error;
        }

        setFiches(data);
      } catch (error) {
        setError('Erreur lors de la récupération des fiches.');
        console.error('Error fetching fiches:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiches();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Box>
    );
  }

  return (
    <Box width="80%" margin="auto">
      <Heading as="h1" size="lg" textAlign="center" mb={5}>Liste des Fiches Bilan SUAP</Heading>
      <Stack spacing={10}>
        {fiches.map((fiche, index) => (
          <RenderFicheBilanSUAP key={index} data={fiche} />
        ))}
      </Stack>
    </Box>
  );
};

export default ListFicheBilanSUAP;