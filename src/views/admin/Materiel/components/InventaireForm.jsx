import React, { useState } from 'react';
import { supabase } from './../../../../supabaseClient';
import { Button, FormControl, FormLabel, Input, Textarea, useToast, Select } from '@chakra-ui/react';

const InventaireForm = () => {
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [couleur, setCouleur] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const { error } = await supabase
            .from('vianney_inventaire_materiel')
            .insert([{ nom, description, couleur }]);

        if (error) {
            toast({
                title: "Erreur",
                description: error.message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Succès",
                description: "Matériel ajouté avec succès!",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
            setNom('');
            setDescription('');
            setCouleur('');
        }

        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl isRequired marginBottom="4">
                <FormLabel>Nom</FormLabel>
                <Input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                />
            </FormControl>

            {/* La description n'est pas marquée comme requise */}
            <FormControl marginBottom="4">
                <FormLabel>Description (Facultatif)</FormLabel>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </FormControl>

            {/* La couleur n'est pas marquée comme requise */}
            <FormControl marginBottom="4">
                <FormLabel>Couleur (Facultatif)</FormLabel>
                <Select
                    placeholder="Sélectionner une couleur"
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                >
                    <option value="rouge">Rouge</option>
                    <option value="vert">Vert</option>
                    <option value="bleu">Bleu</option>
                    <option value="jaune">Jaune</option>
                    <option value="noir">Noir</option>
                    <option value="blanc">Blanc</option>
                    <option value="orange">Orange</option>
                    <option value="violet">Violet</option>
                    <option value="gris">Gris</option>
                    <option value="rose">Rose</option>
                    <option value="turquoise">Turquoise</option>
                    <option value="marron">Marron</option>
                    {/* Ajoutez d'autres options de couleurs au besoin */}
                </Select>
            </FormControl>

            <Button
                type="submit"
                colorScheme="blue"
                isLoading={submitting}
                loadingText="En cours"
            >
                Ajouter
            </Button>
        </form>
    );
};

export default InventaireForm;