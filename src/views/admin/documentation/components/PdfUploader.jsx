import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Icon,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";
import { FcUpload } from "react-icons/fc";

const supabaseUrl = "https://nhrsgicthwqsctwggxqz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocnNnaWN0aHdxc2N0d2dneHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkxNzMwODMsImV4cCI6MjAwNDc0OTA4M30.f1MhR4nYjFrCMjMnwjMUwlueADL8wZdPvu4MtrxPglk";

const supabase = createClient(supabaseUrl, supabaseKey);

const PdfUploader = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [formErrors, setFormErrors] = useState({
    file: false,
    title: false,
    description: false,
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorAlert(true);
      setFormErrors({ ...formErrors, file: true });
      return;
    }

    if (!title) {
      setErrorAlert(true);
      setFormErrors({ ...formErrors, title: true });
      return;
    }

    if (!description) {
      setErrorAlert(true);
      setFormErrors({ ...formErrors, description: true });
      return;
    }

    try {
      const { error } = await supabase.storage
        .from("pdfs")
        .upload(fileName, file);
      if (error) {
        setErrorAlert(true);
        return;
      }

      const publicURL = `${supabaseUrl}/storage/v1/object/public/pdfs/${fileName}`;

      const { error: insertError } = await supabase
        .from("pdf_documents")
        .insert({
          file_name: fileName,
          title,
          description,
          file_url: publicURL,
        });

      if (insertError) {
        setErrorAlert(true);
        return;
      }

      setFileUrl(publicURL);
      setSuccessAlert(true);
    } catch (error) {
      setErrorAlert(true);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      border="1px solid #ccc"
      borderRadius="md"
      p="4"
      boxShadow="md"
      background="blue.70"
    >
      <Heading as="h2" size="md" mb="4">
        Ajouter un fichier PDF
      </Heading>
      <VStack spacing={4} alignItems="stretch" width="100%">
        <FormControl pb={5} pt={5} isInvalid={formErrors.file}>
          <FormLabel isRequired>Choisissez un fichier PDF</FormLabel>
          <Input type="file" accept=".pdf" onChange={handleFileChange} />
          {formErrors.file && (
            <FormErrorMessage>Ce champ est requis</FormErrorMessage>
          )}
        </FormControl>
        <FormControl pb={5} pt={5} isInvalid={formErrors.title}>
          <FormLabel isRequired>Titre du document</FormLabel>
          <Input
            type="text"
            placeholder="Titre du document"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {formErrors.title && (
            <FormErrorMessage>Ce champ est requis</FormErrorMessage>
          )}
        </FormControl>
        <FormControl pb={5} pt={5} isInvalid={formErrors.description}>
          <FormLabel isRequired>Description du document</FormLabel>
          <Input
            type="text"
            placeholder="Description du document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {formErrors.description && (
            <FormErrorMessage>Ce champ est requis</FormErrorMessage>
          )}
        </FormControl>

        <Button
          onClick={handleUpload}
          leftIcon={<Icon as={FcUpload} boxSize={5} />}
          colorScheme="teal"
          alignItems="center"
          justifyContent="center"
          pb={5}
          pt={5}
        >
          Cliquez pour ajouter un PDF
        </Button>
        {fileUrl && (
          <Alert status="success" width="100%" pb={5} pt={5}>
            <AlertIcon />
            Le fichier PDF a été téléchargé avec succès!
          </Alert>
        )}
        {errorAlert && (
          <Alert status="error" width="100%" pb={5} pt={5}>
            <AlertIcon />
            Erreur lors du téléchargement du PDF. Attention! Vous ne pouvez
            télécharger 2 fois le même PDF.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default PdfUploader;