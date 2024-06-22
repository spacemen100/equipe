import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Divider,
  useToast
} from '@chakra-ui/react';
import { supabase } from './../../../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
    reportNumber: '',
    incidentDateTime: '',
    incidentLocation: '',
    reporterName: '',
    reporterPosition: '',
    contactInfo: '',
    involvedPersons: '',
    witnesses: '',
    incidentType: '',
    incidentDescription: '',
    materialDamage: '',
    physicalDamage: '',
    attachments: '',
    reporterSignature: '',
    signatureDate: ''
  });

  const toast = useToast();

  useEffect(() => {
    // Generate a unique report number using UUID
    const reportNumber = `RPT-${uuidv4().substring(0, 8)}`;
    // Get the current date and time in the required format
    const currentDateTime = new Date().toISOString().slice(0, 16);

    // Update the form data with the generated values
    setFormData((prevFormData) => ({
      ...prevFormData,
      reportNumber: reportNumber,
      incidentDateTime: currentDateTime,
      signatureDate: new Date().toISOString().split('T')[0] // Only date part
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // eslint-disable-next-line
      const { data, error } = await supabase
        .from('vianney_incident_reports')
        .insert([formData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Form Submitted",
        description: "Your incident report has been submitted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form after successful submission
      const reportNumber = `RPT-${uuidv4().substring(0, 8)}`;
      const currentDateTime = new Date().toISOString().slice(0, 16);

      setFormData({
        reportNumber: reportNumber,
        incidentDateTime: currentDateTime,
        incidentLocation: '',
        reporterName: '',
        reporterPosition: '',
        contactInfo: '',
        involvedPersons: '',
        witnesses: '',
        incidentType: '',
        incidentDescription: '',
        materialDamage: '',
        physicalDamage: '',
        attachments: '',
        reporterSignature: '',
        signatureDate: new Date().toISOString().split('T')[0] // Only date part
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="800px" mx="auto" mt={5} p={5} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center">Formulaire Rapport d'Incident/Information</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="reportNumber" isRequired>
            <FormLabel>Numéro de Rapport</FormLabel>
            <Input name="reportNumber" value={formData.reportNumber} onChange={handleChange} readOnly />
          </FormControl>
          <FormControl id="incidentDateTime" isRequired>
            <FormLabel>Date et Heure de l'Incident</FormLabel>
            <Input type="datetime-local" name="incidentDateTime" value={formData.incidentDateTime} onChange={handleChange} />
          </FormControl>
          <FormControl id="incidentLocation" isRequired>
            <FormLabel>Lieu de l'Incident</FormLabel>
            <Input name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} />
          </FormControl>
          <FormControl id="reporterName" isRequired>
            <FormLabel>Nom et Poste du Rapporteur</FormLabel>
            <Input name="reporterName" value={formData.reporterName} onChange={handleChange} />
          </FormControl>
          <FormControl id="reporterPosition">
            <FormLabel>Poste du Rapporteur</FormLabel>
            <Input name="reporterPosition" value={formData.reporterPosition} onChange={handleChange} />
          </FormControl>
          <FormControl id="contactInfo" isRequired>
            <FormLabel>Coordonnées (Téléphone et Email)</FormLabel>
            <Input name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
          </FormControl>
          <Divider />
          <Heading size="md" alignSelf="flex-start">Personnes Impliquées et Témoins</Heading>
          <FormControl id="involvedPersons" isRequired>
            <FormLabel>Personnes impliquées (noms, rôles, coordonnées)</FormLabel>
            <Textarea name="involvedPersons" value={formData.involvedPersons} onChange={handleChange} />
          </FormControl>
          <FormControl id="witnesses" isRequired>
            <FormLabel>Témoins (noms, rôles, coordonnées)</FormLabel>
            <Textarea name="witnesses" value={formData.witnesses} onChange={handleChange} />
          </FormControl>
          <Divider />
          <Heading size="md" alignSelf="flex-start">Description de l'Incident</Heading>
          <FormControl id="incidentType" isRequired>
            <FormLabel>Type d'Incident (ex. intrusion, vol, accident, incendie, etc.)</FormLabel>
            <Input name="incidentType" value={formData.incidentType} onChange={handleChange} />
          </FormControl>
          <FormControl id="incidentDescription" isRequired>
            <FormLabel>Description détaillée de l'incident</FormLabel>
            <Textarea name="incidentDescription" value={formData.incidentDescription} onChange={handleChange} />
          </FormControl>
          <Divider />
          <Heading size="md" alignSelf="flex-start">Évaluation des Dommages</Heading>
          <FormControl id="materialDamage">
            <FormLabel>Dommages Matériels</FormLabel>
            <Textarea name="materialDamage" value={formData.materialDamage} onChange={handleChange} />
          </FormControl>
          <FormControl id="physicalDamage">
            <FormLabel>Dommages Corporels</FormLabel>
            <Textarea name="physicalDamage" value={formData.physicalDamage} onChange={handleChange} />
          </FormControl>
          <Divider />
          <Heading size="md" alignSelf="flex-start">Pièces Jointes et Documentation</Heading>
          <FormControl id="attachments">
            <FormLabel>Photographies et/ou vidéos</FormLabel>
            <Input type="file" name="attachments" onChange={handleChange} />
          </FormControl>
          <FormControl id="additionalDocuments">
            <FormLabel>Documents supplémentaires (rapports médicaux, déclarations de témoins, etc.)</FormLabel>
            <Input type="file" name="additionalDocuments" onChange={handleChange} />
          </FormControl>
          <Divider />
          <Heading size="md" alignSelf="flex-start">Signature</Heading>
          <FormControl id="reporterSignature" isRequired>
            <FormLabel>Nom et Signature du Rapporteur</FormLabel>
            <Input name="reporterSignature" value={formData.reporterSignature} onChange={handleChange} />
          </FormControl>
          <FormControl id="signatureDate" isRequired>
            <FormLabel>Date</FormLabel>
            <Input type="date" name="signatureDate" value={formData.signatureDate} onChange={handleChange} />
          </FormControl>
          <Button type="submit" colorScheme="blue" size="lg" mt={4}>Soumettre</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default IncidentReportForm;
