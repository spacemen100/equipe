import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Textarea, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Box, Input, Button, VStack, Text, Select, Flex, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Avatar, IconButton } from '@chakra-ui/react';
import { GrSend } from "react-icons/gr";
import { MdMic, MdStop } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FcDeleteDatabase } from "react-icons/fc";
import Card from "components/card/Card";
import { useEvent } from '../../../../EventContext';
import { useTeam } from './../../InterfaceEquipe/TeamContext';
import { BsCheck2All } from "react-icons/bs";

import { supabase, supabaseUrl } from './../../../../supabaseClient';

function MessagerieWhatsappChat() {
    const { selectedTeam, setSelectedTeam, teamData, setTeamData } = useTeam();
    const { selectedEventId } = useEvent();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [newAlertText, setNewAlertText] = useState('');
    const toast = useToast();
    const [details, setDetails] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    // eslint-disable-next-line 
    const [alertToDelete, setAlertToDelete] = useState(null);
    const [password, setPassword] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

    const [showAlert, setShowAlert] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const handlePasswordChange = (event) => {
        const inputPassword = event.target.value;
        setPassword(inputPassword);
        setIsPasswordCorrect(inputPassword === "vianney123");
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
    };

    const handleEditChange = (event) => {
        setEditingAlert({ ...editingAlert, [event.target.name]: event.target.value });
    };

    const handleSubmitEdit = async () => {
        const { error } = await supabase
            .from('vianney_chat_messages')
            .update({
                alert_text: editingAlert.alert_text,
                details: editingAlert.details
            })
            .match({ id: editingAlert.id });

        if (!error) {
            setAlerts(alerts.map(alert => alert.id === editingAlert.id ? editingAlert : alert));
            closeEditModal();
        } else {
            console.error('Error updating alert:', error);
        }
    };

    const closeConfirmModal = () => {
        setIsConfirmOpen(false);
    };

    const handleDeleteAlert = async () => {
        const { error } = await supabase
            .from('vianney_chat_messages')
            .delete()
            .match({ id: alertToDelete });

        if (error) {
            console.error('Error deleting alert:', error);
            toast({
                title: "Erreur",
                description: "Nous n'avons pas réussi à supprimer l'alerte.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } else {
            setAlerts(alerts.filter(alert => alert.id !== alertToDelete));
            toast({
                title: "Succès",
                description: "Alerte supprimée avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
        closeConfirmModal();
        setIsConfirmOpen(false);
    };

    useEffect(() => {
        async function fetchTeamData() {
            try {
                let query = supabase.from('vianney_teams').select('id, name_of_the_team');

                if (selectedEventId) {
                    query = query.eq('event_id', selectedEventId);
                }

                const { data, error } = await query;

                if (error) {
                    throw error;
                }
                setTeamData(data);
            } catch (error) {
                console.error('Error fetching team data:', error);
            }
        }

        fetchTeamData();
    }, [selectedEventId, setTeamData]);

    useEffect(() => {
        if (!selectedTeam) {
            setShowAlert(true);
        } else {
            setShowAlert(false);
        }
    }, [selectedTeam]);

    const fetchAlerts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('vianney_chat_messages')
                .select('*')
                .eq('event_id', selectedEventId)
                .order('timestamp', { ascending: true });

            if (error) {
                console.error('Error fetching alerts:', error);
                return;
            }

            const unreadMessages = data.filter(alert => !alert.read_by_teams.includes(selectedTeam));

            for (const alert of unreadMessages) {
                const updatedReadByTeams = [...alert.read_by_teams, selectedTeam];

                await supabase
                    .from('vianney_chat_messages')
                    .update({ read_by_teams: updatedReadByTeams })
                    .eq('id', alert.id);
            }

            setAlerts(data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    }, [selectedEventId, selectedTeam]);

    useEffect(() => {
        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, 6000);
        return () => clearInterval(intervalId);
    }, [fetchAlerts]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [alerts]);

    const handleInputChange = (event) => {
        setNewAlertText(event.target.value);
    };

    const handleTeamSelection = (event) => {
        const selectedUUID = event.target.value;
        setSelectedTeam(selectedUUID);
        setShowAlert(false);
    };

    const startRecording = async () => {
        setIsRecording(true);
        recordedChunksRef.current = [];

        // Enregistrer uniquement l'audio
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });

            try {
                await uploadAudioToSupabase(blob);
            } catch (error) {
                console.error('Upload failed:', error);
            }

            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const uploadAudioToSupabase = async (blob) => {
        const fileName = `chat_audio_${new Date().toISOString()}.webm`;
        try {
            console.log("Attempting to upload audio blob...");
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('chat-audio')
                .upload(fileName, blob);

            if (uploadError || !uploadData) {
                console.error('Error uploading audio:', uploadError);
                console.log('Upload Data:', uploadData);
                toast({
                    title: "Erreur",
                    description: "Nous n'avons pas pu téléverser l'audio.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                throw new Error('Failed to upload audio');
            }

            const audioUrl = `${supabaseUrl.replace('.co', '.in')}/storage/v1/object/public/chat-audio/${uploadData.path}`;
            console.log('Audio uploaded successfully:', audioUrl);

            console.log("Attempting to insert audio message into database...");
            const messagePayload = {
                alert_text: 'Audio Message',
                user_id: uuidv4(),
                solved_or_not: 'info',
                details: details,
                event_id: selectedEventId,
                audio_url: audioUrl,
                team_name: selectedTeam,
            };
            console.log("Message Payload:", messagePayload);

            const { data: insertedData, error: insertError } = await supabase
                .from('vianney_chat_messages')
                .insert([messagePayload]);

            if (insertError) {
                console.error('Error saving audio message:', insertError);
                console.log('Insert Data:', insertedData);
                toast({
                    title: "Erreur",
                    description: "Nous n'avons pas pu enregistrer l'audio.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                throw new Error('Failed to save audio message');
            }

            console.log("Audio message inserted successfully:", insertedData);
            if (!insertedData || insertedData.length === 0) {
                throw new Error('No data returned from insert operation');
            }

            setAlerts(prevAlerts => [...prevAlerts, { ...insertedData[0], timestamp: new Date().toISOString() }]);
            toast({
                title: "Audio ajouté",
                description: "Votre audio a été ajouté avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Unexpected error uploading audio:', error);
            toast({
                title: "Audio ajouté",
                description: "Votre audio a été ajouté avec succès.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!selectedTeam) {
            toast({
                title: "Erreur",
                description: "Vous devez sélectionner une équipe avant d'envoyer un message.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setShowAlert(true);
            return;
        }

        if (newAlertText.trim() !== '' || selectedFile) {
            const fakeUUID = uuidv4();

            try {
                let imageUrl = '';

                if (selectedFile) {
                    const fileExtension = selectedFile.name.split('.').pop();
                    const fileName = `${uuidv4()}.${fileExtension}`;
                    const filePath = `${fakeUUID}/${fileName}`;

                    let { error: uploadError } = await supabase.storage
                        .from('chat-images')
                        .upload(filePath, selectedFile, {
                            cacheControl: '3600',
                            upsert: false,
                        });

                    if (uploadError) {
                        throw new Error(`Failed to upload image: ${uploadError.message}`);
                    }

                    imageUrl = `${supabaseUrl.replace('.co', '.in')}/storage/v1/object/public/chat-images/${filePath}`;
                }

                const { data, error } = await supabase
                    .from('vianney_chat_messages')
                    .insert([
                        {
                            alert_text: newAlertText,
                            user_id: fakeUUID,
                            solved_or_not: 'info',
                            details: details,
                            event_id: selectedEventId,
                            image_url: imageUrl,
                            team_name: selectedTeam,
                        },
                    ]);

                if (error) {
                    throw new Error(`Failed to insert alert: ${error.message}`);
                }

                if (data && data.length > 0) {
                    setAlerts([...alerts, { ...data[0], timestamp: new Date().toISOString() }]);
                } else {
                    console.error('No data returned from the insert operation.');
                }

                setNewAlertText('');
                setDetails('');
                setSelectedFile(null);
                setPreviewImage(null);

                toast({
                    title: "Alerte ajoutée",
                    description: "Votre alerte a été ajoutée avec succès.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } catch (error) {
                console.error(error.message);
                toast({
                    title: "Erreur",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } else {
            console.error('Alert text is required.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // Limite de 10MB
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "Erreur",
                    description: "Le fichier est trop volumineux.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            // Vérification du type de fichier pour accepter uniquement les images
            if (file.type.startsWith("image/")) {
                setPreviewImage(URL.createObjectURL(file));
                setSelectedFile(file);
            } else {
                toast({
                    title: "Erreur",
                    description: "Seules les images sont acceptées.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handlePlusClick = () => {
        fileInputRef.current.click();
    };

    const handleDeleteFile = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage); // Libère la mémoire
        }
        setSelectedFile(null);
        setPreviewImage(null);
    };

    return (
        <Card direction='column' w='100%' h='100vh' overflow='hidden'>
            <Flex direction='column' h='100%'>

                <Box flex='1' overflowY='auto' p={4} bg='#f5f5f5'>
                    <VStack spacing={4} align='stretch'>
                        {alerts.map((alert, index) => {
                            const isOwnMessage = alert.team_name === selectedTeam;
                            const hasBeenRead = alert.read_by_teams.includes(selectedTeam);

                            return (
                                <Flex
                                    key={index}
                                    justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
                                    mb={2}
                                    alignItems="flex-start"
                                >
                                    {!isOwnMessage && (
                                        <Avatar
                                            name={alert.team_name}
                                            bg="blue.500"
                                            color="white"
                                            size="sm"
                                            mr={4}
                                        />
                                    )}
                                    <Box
                                        maxWidth="70%"
                                        bg={isOwnMessage ? 'green.100' : 'white'}
                                        color={isOwnMessage ? 'black' : 'black'}
                                        p={3}
                                        borderRadius="lg"
                                        boxShadow="md"
                                        position="relative"
                                        _before={!isOwnMessage ? {
                                            content: '""',
                                            position: 'absolute',
                                            top: '0',
                                            left: '-12px',
                                            width: '0',
                                            height: '0',
                                            borderStyle: 'solid',
                                            borderWidth: '0 12px 12px 0',
                                            borderColor: 'transparent white transparent transparent',
                                        } : {
                                            content: '""',
                                            position: 'absolute',
                                            top: '0',
                                            right: '-12px',
                                            width: '0',
                                            height: '0',
                                            borderStyle: 'solid',
                                            borderWidth: '12px 12px 0 0',
                                            borderColor: 'green.100 ',
                                        }}
                                        borderTopLeftRadius={!isOwnMessage ? '0' : 'lg'}
                                        borderTopRightRadius={isOwnMessage ? '0' : 'lg'}
                                    >
                                        {!isOwnMessage && (
                                            <Text fontWeight="bold" fontSize="sm" mb={1}>
                                                {alert.team_name}
                                            </Text>
                                        )}
                                        <Text>{alert.alert_text}</Text>
                                        {alert.image_url && (
                                            <Image
                                                src={alert.image_url}
                                                alt="Message image"
                                                maxHeight="200px"
                                                borderRadius="md"
                                                mt={2}
                                            />
                                        )}
                                        {alert.audio_url && (
                                            <audio controls>
                                                <source src={alert.audio_url} type="audio/webm" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                        <Flex justifyContent="space-between" alignItems="center" mt={2}>
                                            <Text fontSize="xs" color="gray.500">
                                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            {hasBeenRead && (
                                                <BsCheck2All color="blue" />
                                            )}
                                        </Flex>
                                    </Box>
                                </Flex>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>
                {showAlert && (
                    <Alert status="error" mb="4" minHeight="100px">
                        <AlertIcon />
                        <AlertTitle>Attention!</AlertTitle>
                        <AlertDescription>
                            Sélectionnez une équipe est obligatoire
                        </AlertDescription>
                        <CloseButton onClick={() => setShowAlert(false)} position="absolute" right="8px" top="8px" />
                    </Alert>
                )}
                {showAlert && !selectedTeam && (
                    <Select
                        value={selectedTeam}
                        onChange={handleTeamSelection}
                        placeholder="Selectionnez une équipe"
                        mb={4}
                    >
                        {teamData.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name_of_the_team}
                            </option>
                        ))}
                    </Select>
                )}

                <Box p={4} borderTop='1px solid #e0e0e0' bg='white' width='100%' position="sticky" bottom="0">
                    {previewImage && (
                        <Box mb={4} position="relative">
                            <Image src={previewImage} alt="Image Preview" maxH="100px" borderRadius="md" />
                            <IconButton
                                icon={<FcDeleteDatabase />}
                                position="absolute"
                                top="0"
                                right="0"
                                size="sm"
                                colorScheme="red"
                                onClick={handleDeleteFile}
                            />
                        </Box>
                    )}
                    <Flex width='100%' alignItems='center'>
                        <IconButton
                            icon={<AiOutlinePlus />}
                            mr={2}
                            flex='1'
                            variant="outline"
                            colorScheme="blue"
                            onClick={handlePlusClick}
                        />
                        <Input
                            type="file"
                            accept="image/*;capture=camera"
                            capture="environment" // Utilisez "user" pour la caméra frontale, "environment" pour la caméra arrière
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                setSelectedFile(e.target.files[0]);
                                handleFileChange(e);
                            }}
                        />
                        <IconButton
                            icon={isRecording ? <MdStop /> : <MdMic />}
                            mr={2}
                            flex='1'
                            variant="outline"
                            colorScheme="blue"
                            onClick={isRecording ? stopRecording : startRecording}
                        />
                        <Input
                            placeholder="Entrez un message..."
                            value={newAlertText}
                            onChange={handleInputChange}
                            mr={2}
                            flex='3'
                            borderRadius="full"
                        />
                        <IconButton
                            icon={<GrSend />}
                            onClick={handleSubmit}
                            flex='1'
                            variant="outline"
                            colorScheme="blue"
                        />
                    </Flex>
                </Box>
            </Flex>

            <Modal isOpen={isEditOpen} onClose={closeEditModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modifier le message</ModalHeader>
                    <ModalBody>
                        <Input
                            name="alert_text"
                            value={editingAlert?.alert_text || ''}
                            onChange={handleEditChange}
                            placeholder="Texte du message"
                            mt={2}
                        />
                        <Textarea
                            name="details"
                            value={editingAlert?.details || ''}
                            onChange={handleEditChange}
                            placeholder="Détails du message"
                            mt={2}
                        />
                        <Image
                            src={editingAlert?.image_url || ''}
                            alt="Image"
                            mt={2}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmitEdit}>
                            Enregistrer les modifications
                        </Button>
                        <Button variant="ghost" onClick={closeEditModal}>Annuler</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Supprimer le message</ModalHeader>
                    <ModalBody>
                        Voulez-vous supprimer ce message ?
                        <Input
                            placeholder="Entrez votre mot de passe"
                            value={password}
                            onChange={handlePasswordChange}
                            mt={2}
                            type="password"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="red"
                            mr={3}
                            onClick={handleDeleteAlert}
                            hidden={!isPasswordCorrect}
                        >
                            Supprimer
                        </Button>
                        <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>Annuler</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Card>
    );
}

export default MessagerieWhatsappChat;

