import React, { useRef } from 'react';
import { Box, Heading, Text, SimpleGrid, Divider, Button } from "@chakra-ui/react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RenderFicheBilanSUAPBis = ({ data }) => {
  const ficheRef1 = useRef();
  const ficheRef2 = useRef();

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    const addSectionToPDF = async (input, pdf, yOffset = 0) => {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = yOffset;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      return heightLeft;
    };

    const input1 = ficheRef1.current;
    const input2 = ficheRef2.current;

    await addSectionToPDF(input1, pdf);
    pdf.addPage();
    await addSectionToPDF(input2, pdf);

    pdf.save(`fiche_bilan_${data.nom}_${data.prenom}_N°INTER_${data.inter_number}.pdf`);
  };

  const renderList = (items) => {
    if (Array.isArray(items) && items.length > 0) {
      return items.join(', ');
    }
    return 'N/A';
  };

  return (
    <>
      <Box ref={ficheRef1} width="80%" margin="auto" border="1px" borderColor="gray.300" borderRadius="md" p={5} boxShadow="md" mb={10}>
        <Button onClick={handleDownloadPDF} colorScheme="blue" mt={4}>
          Télécharger en PDF
        </Button>
        <Heading as="h1" size="lg" textAlign="center" mb={5}>
          FICHE BILAN SUAP - N° INTER: {data.inter_number}
        </Heading>

        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Engin A:</Text>
            <Text>{data.engin_a}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Engin B:</Text>
            <Text>{data.engin_b}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Date:</Text>
            <Text>{data.date}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Début événement:</Text>
            <Text>{data.debut_event}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Prise en charge:</Text>
            <Text>{data.prise_charge}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Convergence:</Text>
            <Text>{data.convergence}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Arrivée à l'hôpital:</Text>
            <Text>{data.arrive_hop}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Nom de l'Événement:</Text>
            <Text>{data.event_name}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Nom de l'Équipe:</Text>
            <Text>{data.team_name}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <Heading as="h2" size="md" mb={3}>État Civil Victime</Heading>
        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Nom:</Text>
            <Text>{data.nom}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Prénom:</Text>
            <Text>{data.prenom}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Date de Naissance:</Text>
            <Text>{data.date_naissance}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Âge:</Text>
            <Text>{data.age}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Adresse:</Text>
            <Text>{data.adresse}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Téléphone:</Text>
            <Text>{data.tel}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Médecin Traitant:</Text>
            <Text>{data.medecin_traitant}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Personne à Prévenir:</Text>
            <Text>{data.personne_prevenir}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Téléphone Personne à Prévenir:</Text>
            <Text>{data.tel_personne_prevenir}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <Heading as="h2" size="md" mb={3}>Bilan Circonstanciel</Heading>
        <Box my={5}>
          <Text fontWeight="bold">Circonstances:</Text>
          <Text>{data.circonstances}</Text>
        </Box>
        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Lieu:</Text>
            <Text>{renderList(data.lieu)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Accident de Circulation:</Text>
            <Text>{renderList(data.accident_circulation)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Type de choc:</Text>
            <Text>{renderList(data.type_choc)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Position dans le véhicule:</Text>
            <Text>{renderList(data.position_vehicule)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Vitesse estimée au moment du choc (Km/h):</Text>
            <Text>{data.vitesse_estimee}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Équipement de sécurité au port de la victime:</Text>
            <Text>{renderList(data.equipement_securite)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Situation à l'arrivée des secours:</Text>
            <Text>{renderList(data.situation_arrivee_secours)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Intoxication par:</Text>
            <Text>{renderList(data.intoxication_par)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Accident divers:</Text>
            <Text>{renderList(data.accident_divers)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Accouchement:</Text>
            <Text>{renderList(data.accouchement)}</Text>
          </Box>
        </SimpleGrid>
      </Box>

      <Box ref={ficheRef2} width="80%" margin="auto" border="1px" borderColor="gray.300" borderRadius="md" p={5} boxShadow="md" mb={10}>
        <Heading as="h2" size="md" mb={3}>Bilan Primaire</Heading>
        <SimpleGrid columns={3} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Voies Aériennes:</Text>
            <Text>{renderList(data.voies_aeriennes)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Respiration:</Text>
            <Text>{renderList(data.respiration)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Circulation:</Text>
            <Text>{renderList(data.circulation)}</Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={3} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Localisation:</Text>
            <Text>{data.localisation}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Sensation de soif:</Text>
            <Text>{data.sensation_de_soif}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Glasgow:</Text>
            <Text>{data.glasgow}</Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Convulsions:</Text>
            <Text>{renderList(data.convulsions)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">État:</Text>
            <Text>{renderList(data.etat)}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <Heading as="h2" size="md" mb={3}>Bilan Secondaire</Heading>
        <SimpleGrid columns={3} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Causes:</Text>
            <Text>{renderList(data.causes)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Fréquence Respiratoire:</Text>
            <Text>{data.frequence_respiratoire}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">SpO2:</Text>
            <Text>{data.spo2}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Fréquence cardiaque:</Text>
            <Text>{data.frequence_cardiaque}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Pouls:</Text>
            <Text>{renderList(data.pouls)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Pupilles:</Text>
            <Text>{renderList(data.pupilles)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Motricité:</Text>
            <Text>{renderList(data.motricite)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Détection des symptômes:</Text>
            <Text>{renderList(data.detection_symptomes)}</Text>
          </Box>
        </SimpleGrid>

        <Divider my={5} />

        <Heading as="h2" size="md" mb={3}>Besoin et Position d'Évacuation</Heading>
        <SimpleGrid columns={2} spacing={5} my={5}>
          <Box>
            <Text fontWeight="bold">Besoin moyen évacuation:</Text>
            <Text>{data.besoin_evacuation}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Position d'évacuation:</Text>
            <Text>{data.position_evacuation}</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </>
  );
};

export default RenderFicheBilanSUAPBis;
