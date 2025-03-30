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
  Button,
  HStack,
  VStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import supabase from './../../../../supabaseClient';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ExpenseSummaryPDF from './ExpenseSummaryPDF';
import { useEvent } from './../../../../EventContext';
import { FaFilePdf, FaDownload, FaExpand, FaFile, FaEuroSign } from "react-icons/fa6";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const toast = useToast();
  const { selectedEventId } = useEvent();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let query = supabase
          .from('vianney_expenses_reimbursement')
          .select('*');

        if (selectedEventId) {
          query = query.eq('event_id', selectedEventId);
        }

        let { data, error } = await query;

        if (error) {
          throw error;
        }

        setExpenses(data || []);
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

    fetchExpenses();
  }, [toast, selectedEventId]);

  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `https://hvjzemvfstwwhhahecwu.supabase.co/storage/v1/object/public/notedefrais/${filename}`;
  };

  const downloadFile = async (filename) => {
    const url = getFileUrl(filename);
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Erreur de téléchargement',
        description: `Impossible de télécharger le fichier: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openImageModal = (url) => {
    setSelectedImage(url);
    onOpen();
  };

  const renderFilePreview = (filename, label, isExpense = false, compact = false) => {
    const fileUrl = getFileUrl(filename);
    if (!fileUrl) return null;

    const isImage = filename.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isPDF = filename.match(/\.pdf$/i);
    const fileExtension = filename.split('.').pop().toUpperCase();

    if (compact) {
      return (
        <HStack spacing={2}>
          <Button
            size="sm"
            onClick={() => fileUrl && openImageModal(fileUrl)}
            leftIcon={<FaFile />}
            variant="outline"
          >
            Voir
          </Button>
          <Button
            size="sm"
            onClick={() => downloadFile(filename)}
            leftIcon={<FaDownload />}
            colorScheme="blue"
            variant="outline"
          >
            Télécharger
          </Button>
        </HStack>
      );
    }

    return (
      <VStack align="start" spacing={2} mb={4} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
        <HStack justifyContent="space-between" w="100%">
          <Text fontWeight="bold">{label}</Text>
          {isExpense && (
            <Badge colorScheme="green" fontSize="0.8em">
              Justificatif de dépense
            </Badge>
          )}
        </HStack>
        
        {isImage ? (
          <Box position="relative">
            <Image
              src={fileUrl}
              alt={label}
              boxSize="200px"
              objectFit="cover"
              borderRadius="md"
              cursor="pointer"
              onClick={() => openImageModal(fileUrl)}
            />
            <Icon
              as={FaExpand}
              position="absolute"
              top={2}
              right={2}
              color="white"
              bg="rgba(0,0,0,0.5)"
              p={1}
              borderRadius="md"
              cursor="pointer"
              onClick={() => openImageModal(fileUrl)}
            />
          </Box>
        ) : (
          <HStack spacing={3} p={2} bg="white" borderRadius="md" borderWidth="1px">
            <Icon as={isPDF ? FaFilePdf : FaFile} color="red.500" />
            <Text>Fichier {fileExtension}</Text>
          </HStack>
        )}
        
        <Button
          leftIcon={<FaDownload />}
          size="sm"
          onClick={() => downloadFile(filename)}
          colorScheme="blue"
          variant="outline"
        >
          Télécharger
        </Button>
      </VStack>
    );
  };

  const renderExpenseAttachments = (expense) => {
    if (!expense.expenses) return null;
    
    const expensesData = JSON.parse(expense.expenses);
    if (!expensesData || expensesData.length === 0) return null;

    return (
      <GridItem colSpan={2}>
        <Text fontWeight="bold" mb="4" fontSize="lg">Dépenses et justificatifs:</Text>
        
        <Table variant="striped" mb={4}>
          <Thead bg="blue.500">
            <Tr>
              <Th color="white">Dépense</Th>
              <Th color="white" isNumeric>Montant</Th>
              <Th color="white">Justificatif</Th>
            </Tr>
          </Thead>
          <Tbody>
            {expensesData.map((exp, index) => (
              <Tr key={`expense-${index}`}>
                <Td>{exp.name}</Td>
                <Td isNumeric>
                  <HStack justify="flex-end">
                    <Icon as={FaEuroSign} color="green.500" />
                    <Text fontWeight="bold">{exp.cost?.toFixed(2) || '0.00'}</Text>
                  </HStack>
                </Td>
                <Td>
                  {exp.file || exp.fileName ? (
                    renderFilePreview(exp.file || exp.fileName, ``, true, true)
                  ) : (
                    <Text color="gray.500" fontStyle="italic">Aucun justificatif</Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </GridItem>
    );
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p="6">
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Prévisualisation du justificatif</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Prévisualisation"
                maxW="100%"
                maxH="80vh"
                objectFit="contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

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
              {/* Informations de base */}
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

              {/* Pièces jointes principales */}
              {renderFilePreview(expense.rib, "RIB")}
              {renderFilePreview(expense.departure_odometer, "Compteur de kilomètres départ")}
              {renderFilePreview(expense.return_odometer, "Compteur de kilomètres retour")}
              {renderFilePreview(expense.carte_grise, "Carte grise")}

              {/* Trajets */}
              <GridItem colSpan={2}>
                <Text fontWeight="bold" mb="2">Trajets:</Text>
                {expense.trips && JSON.parse(expense.trips).map((trip, index) => (
                  <Box key={`trip-${index}`} mb="2" pl="4" borderLeft="2px solid" borderColor="gray.200">
                    <Text>
                      <Text as="span" fontWeight="semibold">{trip.name}:</Text> {trip.distance} KM
                    </Text>
                  </Box>
                ))}
              </GridItem>

              {/* Justificatifs de dépenses */}
              {renderExpenseAttachments(expense)}

              {/* Bouton de téléchargement du PDF */}
              <GridItem colSpan={2}>
                <HStack justifyContent="flex-end" spacing={4}>
                  <PDFDownloadLink
                    document={<ExpenseSummaryPDF data={expense} trips={JSON.parse(expense.trips)} expenses={JSON.parse(expense.expenses)} />}
                    fileName={`note_de_frais_${expense.volunteer_last_name}_${expense.volunteer_first_name}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        leftIcon={<FaFilePdf />}
                        colorScheme="red"
                        variant="solid"
                        isLoading={loading}
                        size="lg"
                      >
                        Télécharger le PDF récapitulatif
                      </Button>
                    )}
                  </PDFDownloadLink>
                </HStack>
              </GridItem>
            </Grid>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default ExpenseList;
