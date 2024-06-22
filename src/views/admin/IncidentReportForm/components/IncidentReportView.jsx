import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  Image,
  useToast
} from '@chakra-ui/react';
import { supabase } from './../../../../supabaseClient';

const IncidentReportView = ({ reportId }) => {
  const [report, setReport] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_incident_reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (error) {
          throw error;
        }
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchReport();
  }, [reportId, toast]);

  if (!report) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box maxW="800px" mx="auto" mt={5} p={5} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center">Rapport d'Incident</Heading>
      <VStack spacing={4} align="start">
        <Text><strong>Numéro de Rapport:</strong> {report.report_number}</Text>
        <Text><strong>Date et Heure de l'Incident:</strong> {new Date(report.incident_date_time).toLocaleString()}</Text>
        <Text><strong>Lieu de l'Incident:</strong> {report.incident_location}</Text>
        <Text><strong>Équipe rapporteur:</strong> {report.reporter_team}</Text>
        <Text><strong>Poste du Rapporteur:</strong> {report.reporter_position}</Text>
        <Text><strong>Coordonnées:</strong> {report.contact_info}</Text>
        <Divider />
        <Heading size="md">Événement</Heading>
        <Text><strong>ID de l'Événement:</strong> {report.event_uuid}</Text>
        <Text><strong>Nom de l'Événement:</strong> {report.event_name}</Text>
        <Divider />
        <Heading size="md">Personnes Impliquées et Témoins</Heading>
        <Text><strong>Personnes impliquées:</strong> {report.involved_persons}</Text>
        <Text><strong>Témoins:</strong> {report.witnesses}</Text>
        <Divider />
        <Heading size="md">Description de l'Incident</Heading>
        <Text><strong>Type d'Incident:</strong> {report.incident_type}</Text>
        <Text><strong>Description détaillée:</strong> {report.incident_description}</Text>
        <Divider />
        <Heading size="md">Évaluation des Dommages</Heading>
        <Text><strong>Dommages Matériels:</strong> {report.material_damage}</Text>
        <Text><strong>Dommages Corporels:</strong> {report.physical_damage}</Text>
        <Divider />
        <Heading size="md">Pièces Jointes et Documentation</Heading>
        {report.attachments && (
          <Box>
            <Text><strong>Photographies et/ou vidéos:</strong></Text>
            <Image src={report.attachments} alt="Attachments" maxH="200px" />
          </Box>
        )}
        {report.additional_documents && (
          <Box>
            <Text><strong>Documents supplémentaires:</strong></Text>
            <Image src={report.additional_documents} alt="Additional Documents" maxH="200px" />
          </Box>
        )}
        <Divider />
        <Heading size="md">Signature</Heading>
        <Image src={report.reporter_signature} alt="Signature" maxH="200px" />
        <Text><strong>Date:</strong> {new Date(report.signature_date).toLocaleDateString()}</Text>
      </VStack>
    </Box>
  );
};

export default IncidentReportView;
