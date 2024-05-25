import React, { useState, useEffect } from 'react';
import { supabase } from './../../../../supabaseClient';
import { Box, Text, SimpleGrid, Heading, VStack, Badge, Alert, AlertIcon, Button, useToast } from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import './styles.css';

const AfficherMateriels = () => {
    const [materiels, setMateriels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDescriptions, setShowDescriptions] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [printPreviewItems, setPrintPreviewItems] = useState([]);
    const toast = useToast();

    useEffect(() => {
        const chargerMateriels = async () => {
            const { data, error } = await supabase.from('vianney_inventaire_materiel').select('*');
            if (error) {
                console.error('Erreur lors de la récupération des matériels', error);
            } else {
                setMateriels(data);
            }
            setLoading(false);
        };

        chargerMateriels();
    }, []);

    const toggleDescriptions = () => {
        setShowDescriptions(!showDescriptions);
    };
    const handlePrintPreview = () => {
        // Filtrer les éléments sélectionnés pour l'aperçu d'impression
        const filteredItems = materiels.filter(materiel => selectedItems.includes(materiel.id));
        setPrintPreviewItems(filteredItems);

        // Supprimer les éléments non sélectionnés après un court délai
        if (selectedItems.length > 0) {
            setTimeout(() => {
                setMateriels(filteredItems);
                // Délai pour s'assurer que la mise à jour de l'état a eu lieu avant l'impression
                setTimeout(() => {
                    window.print();
                    // Réinitialiser les éléments à l'ensemble complet après l'impression
                    setMateriels([...materiels]);
                }, 1);
            }, 1);
        } else {
            // Si aucun élément n'est sélectionné, imprimer directement
            window.print();
        }
    };

    const handleItemClick = (id) => {
        // Vérifie si l'élément est déjà sélectionné
        const isSelected = selectedItems.includes(id);
        if (isSelected) {
            // Si oui, retire-le de la liste des éléments sélectionnés
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            // Si non, ajoute-le à la liste des éléments sélectionnés
            setSelectedItems([...selectedItems, id]);
            // Afficher le toast indiquant le nombre d'éléments sélectionnés
            toast({
                title: `${selectedItems.length + 1} élément(s) sélectionné(s) pour l'impression.`,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
                zIndex: 9999,
            });
        }
    };

    const isSelected = (id) => {
        // Vérifie si l'élément est sélectionné
        return selectedItems.includes(id);
    };

    if (loading) return <Text>Chargement...</Text>;
    if (materiels.length === 0) return <Text>Aucun matériel enregistré.</Text>;

    return (
        <Box padding="4" >
            <Heading size="md" mb="4">Liste des Matériels</Heading>
            <Button mb="4" onClick={toggleDescriptions}>
                {showDescriptions ? 'Masquer toutes les descriptions' : 'Afficher toutes les descriptions'}
            </Button>
            <SimpleGrid columns={{ base: 4, md: 6, lg: 10 }} spacing="20px" className="print-container">
                {materiels.map((materiel) => (
                    <Box key={materiel.id}
                        p="4"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        bg={isSelected(materiel.id) ? "blue.100" : "white"}
                        onClick={() => handleItemClick(materiel.id)}
                        maxWidth="200px" // Évite que les box s'étendent au-delà de la largeur disponible
                        overflow="hidden" // Cache le contenu débordant, ou "auto" pour ajouter des barres de défilement si nécessaire
                    >
                        <VStack spacing="4">
                            <Badge colorScheme="orange">{materiel.nom}</Badge>
                            {showDescriptions && (
                                <Alert status="info" variant="left-accent">
                                    <AlertIcon />
                                    <Text fontSize="sm"> {/* Utilisez ici la propriété fontSize pour ajuster la taille */}
                                        {materiel.description}
                                    </Text>
                                </Alert>
                            )}
                            <QRCode value={materiel.id} size={128} level="L" includeMargin={true} />
                        </VStack>
                    </Box>
                ))}
            </SimpleGrid>
            <Button mt="4" onClick={handlePrintPreview}>Imprimer</Button>
        </Box>
    );
};

export default AfficherMateriels;