import React, { useState, useEffect, useRef } from 'react';
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
import SignatureCanvas from 'react-signature-canvas';
import { useEvent } from './../../../../EventContext';
import './IncidentReportForm.css'; // Custom CSS for signature canvas

const IncidentReportForm = ({ reportingTeam }) => {
    const { selectedEventId } = useEvent();
    const [formData, setFormData] = useState({
        report_number: '',
        incident_date_time: '',
        incident_location: '',
        reporter_team: '',
        reporter_position: '',
        contact_info: '',
        involved_persons: '',
        witnesses: '',
        incident_type: '',
        incident_description: '',
        material_damage: '',
        physical_damage: '',
        attachments: '',
        additional_documents: '',
        reporter_signature: '',
        signature_date: '',
        event_uuid: ''
    });

    const signatureCanvasRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        // Generate a unique report number using UUID
        const reportNumber = `RPT-${uuidv4().substring(0, 8)}`;
        // Get the current date and time in the required format
        const currentDateTime = new Date().toISOString().slice(0, 16);

        // Update the form data with the generated values
        setFormData((prevFormData) => ({
            ...prevFormData,
            report_number: reportNumber,
            incident_date_time: currentDateTime,
            reporter_team: reportingTeam,
            signature_date: new Date().toISOString().split('T')[0], // Only date part
            event_uuid: selectedEventId || ''
        }));
    }, [reportingTeam, selectedEventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleClearSignature = () => {
        signatureCanvasRef.current.clear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const signatureImage = signatureCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
            const newFormData = { ...formData, reporter_signature: signatureImage };
            // eslint-disable-next-line
            const { data, error } = await supabase
                .from('vianney_incident_reports')
                .insert([newFormData]);

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
                report_number: reportNumber,
                incident_date_time: currentDateTime,
                incident_location: '',
                reporter_team: reportingTeam,
                reporter_position: '',
                contact_info: '',
                involved_persons: '',
                witnesses: '',
                incident_type: '',
                incident_description: '',
                material_damage: '',
                physical_damage: '',
                attachments: '',
                additional_documents: '',
                reporter_signature: '',
                signature_date: new Date().toISOString().split('T')[0], // Only date part,
                event_uuid: selectedEventId || ''
            });
            handleClearSignature(); // Clear the signature pad

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
                    <FormControl id="report_number" isRequired>
                        <FormLabel>Numéro de Rapport</FormLabel>
                        <Input name="report_number" value={formData.report_number} onChange={handleChange} readOnly />
                    </FormControl>
                    <FormControl id="event_uuid" isRequired>
                        <FormLabel>ID de l'Événement</FormLabel>
                        <Input name="event_uuid" value={formData.event_uuid} onChange={handleChange} readOnly />
                    </FormControl>
                    <FormControl id="incident_date_time" isRequired>
                        <FormLabel>Date et Heure de l'Incident</FormLabel>
                        <Input type="datetime-local" name="incident_date_time" value={formData.incident_date_time} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="incident_location" isRequired>
                        <FormLabel>Lieu de l'Incident</FormLabel>
                        <Input name="incident_location" value={formData.incident_location} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="reporter_team" isRequired>
                        <FormLabel>Équipe rapporteur</FormLabel>
                        <Input name="reporter_team" value={formData.reporter_team} onChange={handleChange} readOnly />
                    </FormControl>
                    <FormControl id="reporter_position">
                        <FormLabel>Poste du Rapporteur</FormLabel>
                        <Input name="reporter_position" value={formData.reporter_position} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="contact_info" isRequired>
                        <FormLabel>Coordonnées (Téléphone et Email)</FormLabel>
                        <Input name="contact_info" value={formData.contact_info} onChange={handleChange} />
                    </FormControl>
                    <Divider />
                    <Heading size="md" alignSelf="flex-start">Personnes Impliquées et Témoins</Heading>
                    <FormControl id="involved_persons" isRequired>
                        <FormLabel>Personnes impliquées (noms, rôles, coordonnées)</FormLabel>
                        <Textarea name="involved_persons" value={formData.involved_persons} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="witnesses" isRequired>
                        <FormLabel>Témoins (noms, rôles, coordonnées)</FormLabel>
                        <Textarea name="witnesses" value={formData.witnesses} onChange={handleChange} />
                    </FormControl>
                    <Divider />
                    <Heading size="md" alignSelf="flex-start">Description de l'Incident</Heading>
                    <FormControl id="incident_type" isRequired>
                        <FormLabel>Type d'Incident (ex. intrusion, vol, accident, incendie, etc.)</FormLabel>
                        <Input name="incident_type" value={formData.incident_type} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="incident_description" isRequired>
                        <FormLabel>Description détaillée de l'incident</FormLabel>
                        <Textarea name="incident_description" value={formData.incident_description} onChange={handleChange} />
                    </FormControl>
                    <Divider />
                    <Heading size="md" alignSelf="flex-start">Évaluation des Dommages</Heading>
                    <FormControl id="material_damage">
                        <FormLabel>Dommages Matériels</FormLabel>
                        <Textarea name="material_damage" value={formData.material_damage} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="physical_damage">
                        <FormLabel>Dommages Corporels</FormLabel>
                        <Textarea name="physical_damage" value={formData.physical_damage} onChange={handleChange} />
                    </FormControl>
                    <Divider />
                    <Heading size="md" alignSelf="flex-start">Pièces Jointes et Documentation</Heading>
                    <FormControl id="attachments">
                        <FormLabel>Photographies et/ou vidéos</FormLabel>
                        <Input type="file" name="attachments" onChange={handleChange} />
                    </FormControl>
                    <FormControl id="additional_documents">
                        <FormLabel>Documents supplémentaires (rapports médicaux, déclarations de témoins, etc.)</FormLabel>
                        <Input type="file" name="additional_documents" onChange={handleChange} />
                    </FormControl>
                    <Divider />
                    <Heading size="md" alignSelf="flex-start">Signature</Heading>
                    <FormControl id="reporter_signature" isRequired>
                        <FormLabel>Dessinez votre signature</FormLabel>
                        <Box border="1px solid #e0e0e0" borderRadius="md" p={2}>
                            <SignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
                        </Box>
                        <Button mt={2} size="sm" onClick={handleClearSignature}>Effacer la signature</Button>
                    </FormControl>
                    <FormControl id="signature_date" isRequired>
                        <FormLabel>Date</FormLabel>
                        <Input type="date" name="signature_date" value={formData.signature_date} onChange={handleChange} />
                    </FormControl>
                    <Button type="submit" colorScheme="blue" size="lg" mt={4}>Soumettre</Button>
                </VStack>
            </form>
        </Box>
    );
};

export default IncidentReportForm;
