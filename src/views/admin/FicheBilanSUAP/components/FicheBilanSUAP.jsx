import React, { useState, useEffect } from 'react';
import { Alert, AlertIcon, AlertTitle, Box, Heading, FormControl, FormLabel, Input, Textarea, CheckboxGroup, Checkbox, SimpleGrid, Stack, Grid, GridItem, Button, RadioGroup, Radio } from "@chakra-ui/react";
import { supabase } from './../../../../supabaseClient';
import { useEvent } from './../../../../EventContext';

function FicheBilanSUAP({ teamName }) {
  const { setEventId, selectedEventId } = useEvent();
  const initialState = {
    inter_number: '',
    engin_a: '',
    engin_b: '',
    date: '',
    debut_event: '',
    prise_charge: '',
    convergence: '',
    arrive_hop: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    age: '',
    adresse: '',
    tel: '',
    medecin_traitant: '',
    personne_prevenir: '',
    tel_personne_prevenir: '',
    circonstances: '',
    lieu: '',
    accident_circulation: [],
    type_choc: [],
    position_vehicule: [],
    vitesse_estimee: '',
    equipement_securite: [],
    situation_arrivee_secours: [],
    intoxication_par: [],
    accident_divers: [],
    accouchement: [],
    voies_aeriennes: [],
    respiration: [],
    circulation: [],
    localisation: '',
    sensation_de_soif: '',
    glasgow: '',
    convulsions: [],
    etat: [],
    causes: [],
    frequence_respiratoire: '',
    spo2: '',
    frequence_cardiaque: '',
    pouls: [],
    pupilles: [],
    motricite: [],
    detection_symptomes: [],
    besoin_evacuation: '',
    position_evacuation: '',
    event_name: '',
    team_name: teamName || '' // Set the initial value of team_name to the prop
  };

  const [formData, setFormData] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const generateInterNumber = () => {
      const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      setFormData(prevState => ({ ...prevState, inter_number: randomNumber.toString() }));
    };
    
    const setCurrentDate = () => {
      const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      setFormData(prevState => ({ ...prevState, date: currentDate }));
    };
    
    generateInterNumber();
    setCurrentDate();
  }, []);

  useEffect(() => {
    const fetchEventName = async () => {
      if (selectedEventId) {
        const { data, error } = await supabase
          .from('vianney_event')
          .select('event_name')
          .eq('event_id', selectedEventId)
          .single();
        if (data) {
          setFormData(prevState => ({ ...prevState, event_name: data.event_name }));
        } else {
          console.error('Error fetching event name:', error);
        }
      }
    };

    fetchEventName();
  }, [selectedEventId]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        [id]: checked ? [...prevState[id], value] : prevState[id].filter(v => v !== value)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [id]: value
      }));
    }
  };

  const handleUuidChange = (e) => {
    setEventId(e.target.value);
  };

  const handleSubmit = async () => {
    const dataToSubmit = {
      event_id: selectedEventId,
      event_name: formData.event_name,
      inter_number: formData.inter_number,
      engin_a: formData.engin_a || 'N/A',
      engin_b: formData.engin_b || 'N/A',
      date: formData.date || '1970-01-01',
      debut_event: formData.debut_event || '00:00:00',
      prise_charge: formData.prise_charge || '00:00:00',
      convergence: formData.convergence || '00:00:00',
      arrive_hop: formData.arrive_hop || '00:00:00',
      nom: formData.nom || 'N/A',
      prenom: formData.prenom || 'N/A',
      date_naissance: formData.date_naissance || '1970-01-01',
      age: formData.age ? parseInt(formData.age, 10) : 0,
      adresse: formData.adresse || 'N/A',
      tel: formData.tel || 'N/A',
      medecin_traitant: formData.medecin_traitant || 'N/A',
      personne_prevenir: formData.personne_prevenir || 'N/A',
      tel_personne_prevenir: formData.tel_personne_prevenir || 'N/A',
      circonstances: formData.circonstances || 'N/A',
      lieu: formData.lieu || 'N/A',
      accident_circulation: formData.accident_circulation.length > 0 ? formData.accident_circulation : ['N/A'],
      type_choc: formData.type_choc.length > 0 ? formData.type_choc : ['N/A'],
      position_vehicule: formData.position_vehicule.length > 0 ? formData.position_vehicule : ['N/A'],
      vitesse_estimee: formData.vitesse_estimee ? parseInt(formData.vitesse_estimee, 10) : 0,
      equipement_securite: formData.equipement_securite.length > 0 ? formData.equipement_securite : ['N/A'],
      situation_arrivee_secours: formData.situation_arrivee_secours.length > 0 ? formData.situation_arrivee_secours : ['N/A'],
      intoxication_par: formData.intoxication_par.length > 0 ? formData.intoxication_par : ['N/A'],
      accident_divers: formData.accident_divers.length > 0 ? formData.accident_divers : ['N/A'],
      accouchement: formData.accouchement.length > 0 ? formData.accouchement : ['N/A'],
      voies_aeriennes: formData.voies_aeriennes.length > 0 ? formData.voies_aeriennes : ['N/A'],
      respiration: formData.respiration.length > 0 ? formData.respiration : ['N/A'],
      circulation: formData.circulation.length > 0 ? formData.circulation : ['N/A'],
      localisation: formData.localisation || 'N/A',
      sensation_de_soif: formData.sensation_de_soif || 'N/A',
      glasgow: formData.glasgow || 'N/A',
      convulsions: formData.convulsions.length > 0 ? formData.convulsions : ['N/A'],
      etat: formData.etat.length > 0 ? formData.etat : ['N/A'],
      causes: formData.causes.length > 0 ? formData.causes : ['N/A'],
      frequence_respiratoire: formData.frequence_respiratoire ? parseInt(formData.frequence_respiratoire, 10) : 0,
      spo2: formData.spo2 || 'N/A',
      frequence_cardiaque: formData.frequence_cardiaque ? parseInt(formData.frequence_cardiaque, 10) : 0,
      pouls: formData.pouls.length > 0 ? formData.pouls : ['N/A'],
      pupilles: formData.pupilles.length > 0 ? formData.pupilles : ['N/A'],
      motricite: formData.motricite.length > 0 ? formData.motricite : ['N/A'],
      detection_symptomes: formData.detection_symptomes.length > 0 ? formData.detection_symptomes : ['N/A'],
      besoin_evacuation: formData.besoin_evacuation || 'N/A',
      position_evacuation: formData.position_evacuation || 'N/A',
      team_name: formData.team_name || 'N/A'
    };

    try {
      // eslint-disable-next-line no-unused-vars
      const { data, error } = await supabase.from('vianney_fiche_bilan_suap').insert([dataToSubmit]);

      if (error) {
        throw error;
      }

      setSuccessMessage('Données soumises avec succès !');
      setErrorMessage('');
      setFormData(initialState); // Reset the form after successful submission
    } catch (error) {
      setErrorMessage('Erreur lors de la soumission des données.');
      setSuccessMessage('');
      console.error('Error submitting data:', error.message);
    }
  };

  return (
    <Box width="80%" margin="auto" border="1px" borderColor="black" p={5}>
      <Heading as="h1" size="lg" textAlign="center">
        FICHE BILAN SUAP - N° INTER:
        <Input
          type="text"
          id="inter_number"
          value={formData.inter_number}
          isReadOnly
          size="sm"
          width="auto"
          ml={2}
          textAlign="center"
        />
      </Heading>

      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>ENGIN A:</FormLabel>
          <Input type="text" id="engin_a" value={formData.engin_a} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>ENGIN B:</FormLabel>
          <Input type="text" id="engin_b" value={formData.engin_b} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>Date:</FormLabel>
          <Input type="date" id="date" value={formData.date} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Début évént:</FormLabel>
          <Input type="time" id="debut_event" value={formData.debut_event} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Prise en ch:</FormLabel>
          <Input type="time" id="prise_charge" value={formData.prise_charge} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Convergence:</FormLabel>
          <Input type="time" id="convergence" value={formData.convergence} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Arrivée hôp:</FormLabel>
          <Input type="time" id="arrive_hop" value={formData.arrive_hop} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <Input type="hidden" value={selectedEventId || ''} onChange={handleUuidChange} />

      <FormControl my={5}>
        <FormLabel>Nom de l'événement:</FormLabel>
        <Input type="text" id="event_name" value={formData.event_name} isReadOnly />
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Nom de l'équipe:</FormLabel>
        <Input type="text" id="team_name" value={formData.team_name} onChange={handleChange} />
      </FormControl>

      <Box bg="black" color="white" p={2} textAlign="center" my={5}>ÉTAT CIVIL VICTIME</Box>

      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>NOM:</FormLabel>
          <Input type="text" id="nom" value={formData.nom} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>PRÉNOM:</FormLabel>
          <Input type="text" id="prenom" value={formData.prenom} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>DATE DE NAISSANCE:</FormLabel>
          <Input type="date" id="date_naissance" value={formData.date_naissance} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>ÂGE:</FormLabel>
          <Input type="number" id="age" value={formData.age} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <FormControl my={5}>
        <FormLabel>ADRESSE DE LA VICTIME:</FormLabel>
        <Textarea id="adresse" value={formData.adresse} onChange={handleChange} />
      </FormControl>

      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>TEL:</FormLabel>
          <Input type="tel" id="tel" value={formData.tel} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>MÉDECIN TRAITANT:</FormLabel>
          <Input type="text" id="medecin_traitant" value={formData.medecin_traitant} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>PERSONNE À PRÉVENIR:</FormLabel>
          <Input type="text" id="personne_prevenir" value={formData.personne_prevenir} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>TEL:</FormLabel>
          <Input type="tel" id="tel_personne_prevenir" value={formData.tel_personne_prevenir} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <Box bg="black" color="white" p={2} textAlign="center" my={5}>BILAN CIRCONSTANCIEL</Box>
      <FormControl my={5}>
        <FormLabel>CIRCONSTANCES:</FormLabel>
        <Textarea id="circonstances" value={formData.circonstances} onChange={handleChange} />
      </FormControl>
      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>Lieu:</FormLabel>
          <CheckboxGroup value={formData.lieu} onChange={(value) => setFormData({ ...formData, lieu: value })}>
            <Stack direction="row">
              <Checkbox value="VR">V.R</Checkbox>
              <Checkbox value="Domicile">Domicile</Checkbox>
              <Checkbox value="Travail">Travail</Checkbox>
              <Checkbox value="ERP">ERP</Checkbox>
              <Checkbox value="Milieu naturel">Milieu naturel</Checkbox>
              <Checkbox value="Autres">Autres</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Accident de circulation:</FormLabel>
          <CheckboxGroup value={formData.accident_circulation} onChange={(value) => setFormData({ ...formData, accident_circulation: value })}>
            <Stack direction="row">
              <Checkbox value="Piéton">Piéton</Checkbox>
              <Checkbox value="Deux roues">Deux roues</Checkbox>
              <Checkbox value="VL">VL</Checkbox>
              <Checkbox value="PL">PL</Checkbox>
              <Checkbox value="Bus">Bus</Checkbox>
              <Checkbox value="Autre">Autre</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
      </SimpleGrid>

      <FormControl my={5}>
        <FormLabel>Type de choc:</FormLabel>
        <CheckboxGroup value={formData.type_choc} onChange={(value) => setFormData({ ...formData, type_choc: value })}>
          <Stack direction="row">
            <Checkbox value="Frontal">Frontal</Checkbox>
            <Checkbox value="Latéral">Latéral</Checkbox>
            <Checkbox value="Fronto-latéral">Fronto-latéral</Checkbox>
            <Checkbox value="Arrière">Arrière</Checkbox>
            <Checkbox value="Tonneaux">Tonneaux</Checkbox>
            <Checkbox value="Obstacle fixe">Obstacle fixe</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Position dans le véhicule:</FormLabel>
        <CheckboxGroup value={formData.position_vehicule} onChange={(value) => setFormData({ ...formData, position_vehicule: value })}>
          <Stack direction="row">
            <Checkbox value="Conducteur">Conducteur</Checkbox>
            <Checkbox value="Passager AV">Passager AV</Checkbox>
            <Checkbox value="Passager AR">Passager AR</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Vitesse estimée au moment du choc (Km/h):</FormLabel>
        <Input type="number" id="vitesse_estimee" value={formData.vitesse_estimee} onChange={handleChange} />
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Équipement de sécurité au port de la victime:</FormLabel>
        <CheckboxGroup value={formData.equipement_securite} onChange={(value) => setFormData({ ...formData, equipement_securite: value })}>
          <Stack direction="row">
            <Checkbox value="Airbag type">Airbag type</Checkbox>
            <Checkbox value="Ceinture">Ceinture</Checkbox>
            <Checkbox value="Aucune">Aucune</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Situation à l'arrivée des secours:</FormLabel>
        <CheckboxGroup value={formData.situation_arrivee_secours} onChange={(value) => setFormData({ ...formData, situation_arrivee_secours: value })}>
          <Stack direction="row">
            <Checkbox value="Incarcéré">Incarcéré</Checkbox>
            <Checkbox value="Éjecté, projeté">Éjecté, projeté</Checkbox>
            <Checkbox value="Casque retiré">Casque retiré</Checkbox>
            <Checkbox value="Pégé">Pégé</Checkbox>
            <Checkbox value="Sortie du véhicule">Sortie du véhicule</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Intoxication par:</FormLabel>
        <CheckboxGroup value={formData.intoxication_par} onChange={(value) => setFormData({ ...formData, intoxication_par: value })}>
          <Stack direction="row">
            <Checkbox value="Alcool">Alcool</Checkbox>
            <Checkbox value="Fumées d'incendie">Fumées d'incendie</Checkbox>
            <Checkbox value="Médicaments">Médicaments</Checkbox>
            <Checkbox value="Autres">Autres</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Accident divers:</FormLabel>
        <CheckboxGroup value={formData.accident_divers} onChange={(value) => setFormData({ ...formData, accident_divers: value })}>
          <Stack direction="row">
            <Checkbox value="Arme à feu">Arme à feu</Checkbox>
            <Checkbox value="Pendaison-étrangulation">Pendaison-étrangulation</Checkbox>
            <Checkbox value="Noyade">Noyade</Checkbox>
            <Checkbox value="Electrisation">Electrisation</Checkbox>
            <Checkbox value="Chute">Chute</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl my={5}>
        <FormLabel>Accouchement:</FormLabel>
        <CheckboxGroup value={formData.accouchement} onChange={(value) => setFormData({ ...formData, accouchement: value })}>
          <Stack direction="row">
            <Checkbox value="Début de travail">Début de travail</Checkbox>
            <Checkbox value="Accouchement réalisé">Accouchement réalisé</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <Box bg="black" color="white" p={2} textAlign="center" my={5}>BILAN PRIMAIRE</Box>

      <Grid templateColumns="repeat(3, 1fr)" gap={5} my={5}>
        <GridItem>
          <FormControl>
            <FormLabel>Voies aériennes (VA):</FormLabel>
            <CheckboxGroup value={formData.voies_aeriennes} onChange={(value) => setFormData({ ...formData, voies_aeriennes: value })}>
              <Stack direction="column">
                <Checkbox value="Libres">Libres</Checkbox>
                <Checkbox value="Obstruction totale des VA">Obstruction totale des VA</Checkbox>
                <Checkbox value="Obstruction partielle des VA">Obstruction partielle des VA</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Respiration:</FormLabel>
            <CheckboxGroup value={formData.respiration} onChange={(value) => setFormData({ ...formData, respiration: value })}>
              <Stack direction="column">
                <Checkbox value="Normale">Normale</Checkbox>
                <Checkbox value="Arrêt respiratoire ou pause > 6s">Arrêt respiratoire ou pause > 6s</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Circulation:</FormLabel>
            <CheckboxGroup value={formData.circulation} onChange={(value) => setFormData({ ...formData, circulation: value })}>
              <Stack direction="column">
                <Checkbox value="Normale">Normale</Checkbox>
                <Checkbox value="Pouls radial non perçu">Pouls radial non perçu</Checkbox>
                <Checkbox value="Hémorragie contrôlée">Hémorragie contrôlée</Checkbox>
                <Checkbox value="Hémorragie non contrôlée">Hémorragie non contrôlée</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
      </Grid>

      <SimpleGrid columns={3} spacing={5} my={5}>
        <FormControl>
          <FormLabel>Localisation:</FormLabel>
          <Input type="text" id="localisation" value={formData.localisation} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Sensation de soif:</FormLabel>
          <Input type="text" id="sensation_de_soif" value={formData.sensation_de_soif} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Glasgow:</FormLabel>
          <Input type="text" id="glasgow" value={formData.glasgow} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>Convulsions:</FormLabel>
          <CheckboxGroup value={formData.convulsions} onChange={(value) => setFormData({ ...formData, convulsions: value })}>
            <Stack direction="column">
              <Checkbox value="Convulsions répétitives">Convulsions répétitives</Checkbox>
              <Checkbox value="Pupilles asymétriques">Pupilles asymétriques</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
        <FormControl>
          <FormLabel>État:</FormLabel>
          <CheckboxGroup value={formData.etat} onChange={(value) => setFormData({ ...formData, etat: value })}>
            <Stack direction="column">
              <Checkbox value="Non réactif">Non réactif</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>
      </SimpleGrid>

      <Box bg="black" color="white" p={2} textAlign="center" my={5}>BILAN SECONDAIRE</Box>

      <Grid templateColumns="repeat(3, 1fr)" gap={5} my={5}>
        <GridItem>
          <FormControl>
            <FormLabel>Causes:</FormLabel>
            <CheckboxGroup value={formData.causes} onChange={(value) => setFormData({ ...formData, causes: value })}>
              <Stack direction="column">
                <Checkbox value="Corps étranger">Corps étranger</Checkbox>
                <Checkbox value="Trauma cervical">Trauma cervical</Checkbox>
                <Checkbox value="Autres">Autres</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Fréquence respiratoire (FR):</FormLabel>
            <Input type="number" id="frequence_respiratoire" value={formData.frequence_respiratoire} onChange={handleChange} />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>SpO2:</FormLabel>
            <Input type="text" id="spo2" value={formData.spo2} onChange={handleChange} />
          </FormControl>
        </GridItem>
      </Grid>

      <Grid templateColumns="repeat(3, 1fr)" gap={5} my={5}>
        <GridItem>
          <FormControl>
            <FormLabel>Fréquence cardiaque (FC):</FormLabel>
            <Input type="number" id="frequence_cardiaque" value={formData.frequence_cardiaque} onChange={handleChange} />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Pouls:</FormLabel>
            <CheckboxGroup value={formData.pouls} onChange={(value) => setFormData({ ...formData, pouls: value })}>
              <Stack direction="column">
                <Checkbox value="Régulier">Régulier</Checkbox>
                <Checkbox value="Irrégulier">Irrégulier</Checkbox>
                <Checkbox value="Filant">Filant</Checkbox>
                <Checkbox value="Asymétrique">Asymétrique</Checkbox>
                <Checkbox value="Bradycardie">Bradycardie</Checkbox>
                <Checkbox value="Tachycardie">Tachycardie</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Pupilles:</FormLabel>
            <CheckboxGroup value={formData.pupilles} onChange={(value) => setFormData({ ...formData, pupilles: value })}>
              <Stack direction="column">
                <Checkbox value="Normales">Normales</Checkbox>
                <Checkbox value="Serrées">Serrées</Checkbox>
                <Checkbox value="Dilatées">Dilatées</Checkbox>
                <Checkbox value="Non réactives">Non réactives</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
      </Grid>

      <Grid templateColumns="repeat(3, 1fr)" gap={5} my={5}>
        <GridItem>
          <FormControl>
            <FormLabel>Motricité:</FormLabel>
            <CheckboxGroup value={formData.motricite} onChange={(value) => setFormData({ ...formData, motricite: value })}>
              <Stack direction="column">
                <Checkbox value="Normale">Normale</Checkbox>
                <Checkbox value="Déficit sensitif">Déficit sensitif</Checkbox>
                <Checkbox value="Paralysie">Paralysie</Checkbox>
                <Checkbox value="Agitation">Agitation</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Détection des symptômes:</FormLabel>
            <CheckboxGroup value={formData.detection_symptomes} onChange={(value) => setFormData({ ...formData, detection_symptomes: value })}>
              <Stack direction="column">
                <Checkbox value="Hypo">Hypo</Checkbox>
                <Checkbox value="Hypotension">Hypotension</Checkbox>
                <Checkbox value="Hyper">Hyper</Checkbox>
                <Checkbox value="Hypothermie">Hypothermie</Checkbox>
                <Checkbox value="Hyperthermie">Hyperthermie</Checkbox>
                <Checkbox value="Hypoxie">Hypoxie</Checkbox>
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </GridItem>
      </Grid>

      <Box bg="black" color="white" p={2} textAlign="center" my={5}>BESOIN ET POSITION D'ÉVACUATION</Box>
      <SimpleGrid columns={2} spacing={5} my={5}>
        <FormControl>
          <FormLabel>Besoin moyen évacuation ?</FormLabel>
          <RadioGroup id="besoin_evacuation" value={formData.besoin_evacuation} onChange={(value) => setFormData({ ...formData, besoin_evacuation: value })}>
            <Stack direction="row">
              <Radio value="Oui">Oui</Radio>
              <Radio value="Non">Non</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Quelle position d'évacuation:</FormLabel>
          <RadioGroup id="position_evacuation" value={formData.position_evacuation} onChange={(value) => setFormData({ ...formData, position_evacuation: value })}>
            <Stack direction="row">
              <Radio value="assis">Assis</Radio>
              <Radio value="couché">Couché</Radio>
              <Radio value="debout">Debout</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </SimpleGrid>

      <Button onClick={handleSubmit} colorScheme="blue" mt={4}>
        Soumettre
      </Button>
      {successMessage && (
        <Alert status="success" my={4}>
          <AlertIcon />
          <AlertTitle>{successMessage}</AlertTitle>
        </Alert>
      )}
      {errorMessage && (
        <Alert status="error" my={4}>
          <AlertIcon />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      )}
    </Box>
  );
}

export default FicheBilanSUAP;
