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
  Divider,
} from '@chakra-ui/react';
import { supabase } from './../../../../supabaseClient';
import jsPDF from 'jspdf';
import { useEvent } from './../../../../EventContext';

const IncidentReportsList = () => {
  const { selectedEventId } = useEvent();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_incident_reports')
          .select('*')
          .eq('event_uuid', selectedEventId);

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

    if (selectedEventId) {
      fetchReports();
    }
  }, [selectedEventId, toast]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const toDataURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) return;

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Rapport d'Incident", 10, 10);

    doc.setFontSize(10);
    doc.text(`Numéro de Rapport: ${selectedReport.report_number}`, 10, 20);
    doc.text(`Date et Heure de l'Incident: ${new Date(selectedReport.incident_date_time).toLocaleString()}`, 10, 30);
    doc.text(`Lieu de l'Incident: ${selectedReport.incident_location}`, 10, 40);
    doc.text(`Équipe rapporteur: ${selectedReport.reporter_team}`, 10, 50);
    doc.text(`Poste du Rapporteur: ${selectedReport.reporter_position}`, 10, 60);
    doc.text(`Coordonnées: ${selectedReport.contact_info}`, 10, 70);

    doc.setFontSize(12);
    doc.text("Événement", 10, 80);

    doc.setFontSize(10);
    doc.text(`Nom de l'Événement: ${selectedReport.event_name}`, 10, 90);

    doc.setFontSize(12);
    doc.text("Personnes Impliquées et Témoins", 10, 100);

    doc.setFontSize(10);
    doc.text(`Personnes impliquées: ${selectedReport.involved_persons}`, 10, 110);
    doc.text(`Témoins: ${selectedReport.witnesses}`, 10, 120);

    doc.setFontSize(12);
    doc.text("Description de l'Incident", 10, 130);

    doc.setFontSize(10);
    doc.text(`Type d'Incident: ${selectedReport.incident_type}`, 10, 140);
    doc.text(`Description détaillée: ${selectedReport.incident_description}`, 10, 150);

    doc.setFontSize(12);
    doc.text("Évaluation des Dommages", 10, 160);

    doc.setFontSize(10);
    doc.text(`Dommages Matériels: ${selectedReport.material_damage}`, 10, 170);
    doc.text(`Dommages Corporels: ${selectedReport.physical_damage}`, 10, 180);

    doc.setFontSize(12);
    doc.text("Pièces Jointes et Documentation", 10, 190);

    const attachmentY = 200;
    const imageSize = 25;

    if (selectedReport.attachments_urls) {
      const imageData = await toDataURL(selectedReport.attachments_urls);
      doc.addImage(imageData, 'JPEG', 10, attachmentY, imageSize, imageSize);
    }

    if (selectedReport.additional_documents_urls) {
      const imageData = await toDataURL(selectedReport.additional_documents_urls);
      doc.addImage(imageData, 'JPEG', 45, attachmentY, imageSize, imageSize);
    }

    doc.setFontSize(12);
    doc.text("Signature", 10, 230);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date(selectedReport.signature_date).toLocaleDateString()}`, 10, 240);

    // Optional: Add the signature image to the PDF
    if (selectedReport.reporter_signature) {
      const imgData = selectedReport.reporter_signature;
      doc.addImage(imgData, 'PNG', 10, 250, 40, 15); // Adjust the size and position as needed
    }

    doc.save(`Rapport_${selectedReport.report_number}.pdf`);
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="full">
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
                <Heading size="md">Événement</Heading>
                <Text><strong>Nom de l'Événement:</strong> {selectedReport.event_name}</Text>
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
                {selectedReport.attachments_urls && (
                  <Box>
                    <Text><strong>Photographies et/ou vidéos:</strong></Text>
                    <Image src={selectedReport.attachments_urls} alt="Photographie" maxH="100px" />
                  </Box>
                )}
                {selectedReport.additional_documents_urls && (
                  <Box>
                    <Text><strong>Documents supplémentaires:</strong></Text>
                    <Image src={selectedReport.additional_documents_urls} alt="Document supplémentaire" maxH="100px" />
                  </Box>
                )}
                <Divider />
                <Heading size="md">Signature</Heading>
                <Image src={selectedReport.reporter_signature} alt="Signature" maxH="100px" />
                <Text><strong>Date:</strong> {new Date(selectedReport.signature_date).toLocaleDateString()}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleDownloadReport}>Télécharger le rapport</Button>
            <Button onClick={handleCloseModal}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default IncidentReportsList;
