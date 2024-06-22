import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Divider
} from '@chakra-ui/react';
import { supabase } from './../../../../supabaseClient';

const IncidentReportsList = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_incident_reports')
          .select('*');

        if (error) {
          throw error;
        }
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchReports();
  }, [toast]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <Box maxW="800px" mx="auto" mt={5} p={5} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center">Liste des Rapports d'Incident</Heading>
      <VStack spacing={4} align="start">
        {reports.map((report) => (
          <Box key={report.id} w="100%" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
            <Text><strong>Numéro de Rapport:</strong> {report.report_number}</Text>
            <Text><strong>Date et Heure de l'Incident:</strong> {new Date(report.incident_date_time).toLocaleString()}</Text>
            <Text><strong>Lieu de l'Incident:</strong> {report.incident_location}</Text>
            <Text><strong>Équipe rapporteur:</strong> {report.reporter_team}</Text>
            <Button mt={2} colorScheme="blue" size="sm" onClick={() => handleViewDetails(report)}>Voir les détails</Button>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Détails du Rapport d'Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <VStack spacing={4} align="start">
                <Text><strong>Numéro de Rapport:</strong> {selectedReport.report_number}</Text>
                <Text><strong>Date et Heure de l'Incident:</strong> {new Date(selectedReport.incident_date_time).toLocaleString()}</Text>
                <Text><strong>Lieu de l'Incident:</strong> {selectedReport.incident_location}</Text>
                <Text><strong>Équipe rapporteur:</strong> {selectedReport.reporter_team}</Text>
                <Text><strong>Poste du Rapporteur:</strong> {selectedReport.reporter_position}</Text>
                <Text><strong>Coordonnées:</strong> {selectedReport.contact_info}</Text>
                <Divider />
                <Heading size="md">Personnes Impliquées et Témoins</Heading>
                <Text><strong>Personnes impliquées:</strong> {selectedReport.involved_persons}</Text>
                <Text><strong>Témoins:</strong> {selectedReport.witnesses}</Text>
                <Divider />
                <Heading size="md">Description de l'Incident</Heading>
                <Text><strong>Type d'Incident:</strong> {selectedReport.incident_type}</Text>
                <Text><strong>Description détaillée:</strong> {selectedReport.incident_description}</Text>
                <Divider />
                <Heading size="md">Évaluation des Dommages</Heading>
                <Text><strong>Dommages Matériels:</strong> {selectedReport.material_damage}</Text>
                <Text><strong>Dommages Corporels:</strong> {selectedReport.physical_damage}</Text>
                <Divider />
                <Heading size="md">Pièces Jointes et Documentation</Heading>
                {selectedReport.attachments && (
                  <Box>
                    <Text><strong>Photographies et/ou vidéos:</strong></Text>
                    <Image src={selectedReport.attachments} alt="Attachments" maxH="200px" />
                  </Box>
                )}
                {selectedReport.additional_documents && (
                  <Box>
                    <Text><strong>Documents supplémentaires:</strong></Text>
                    <Image src={selectedReport.additional_documents} alt="Additional Documents" maxH="200px" />
                  </Box>
                )}
                <Divider />
                <Heading size="md">Signature</Heading>
                <Image src={selectedReport.reporter_signature} alt="Signature" maxH="200px" />
                <Text><strong>Date:</strong> {new Date(selectedReport.signature_date).toLocaleDateString()}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCloseModal}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default IncidentReportsList;
