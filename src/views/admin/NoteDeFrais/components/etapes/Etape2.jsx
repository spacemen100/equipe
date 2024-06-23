import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
} from '@chakra-ui/react';

function Etape2() {
  return (
    <Box
      mt="10"
      p="6"
      boxShadow="lg"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
    >
      <Grid templateColumns="repeat(2, 1fr)" gap="4">
        <GridItem colSpan={2}>
          <FormControl id="vehicleType" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1"
            >
              Véhicule personnel
            </FormLabel>
            <Select
              placeholder="Sélectionner un type de véhicule"
              borderColor="gray.300"
              borderRadius="md"
              height="40px"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            >
              <option value="voiture">Voiture - Camion</option>
              {/* Add other vehicle options as needed */}
            </Select>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="fiscalPower" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1"
            >
              Puissance fiscale (P6 carte grise)
            </FormLabel>
            <Input
              placeholder="6"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="registration" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1"
            >
              Immatriculation
            </FormLabel>
            <Input
              placeholder="Ex. GD-271-NR"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="brand" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1"
            >
              Marque
            </FormLabel>
            <Input
              placeholder="Ex. Peugeot"
              borderColor="gray.300"
              _placeholder={{ color: 'gray.500' }}
              borderRadius="md"
              height="40px"
              position="relative"
              zIndex="0"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500', zIndex: '0' }}
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="departureOdometer" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1000"
            >
              Compteur de kilomètres départ
            </FormLabel>
            <Box position="relative" height="100px">
              <Input
                type="file"
                opacity="0"
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
              >
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="returnOdometer" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1000"
            >
              Compteur de kilomètres retour
            </FormLabel>
            <Box position="relative" height="100px">
              <Input
                type="file"
                opacity="0"
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
              >
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl id="carteGrise" position="relative" mt="6">
            <FormLabel
              position="absolute"
              top="-0.6rem"
              left="1rem"
              bg="white"
              px="0.25rem"
              fontSize="xs"
              fontWeight="bold"
              zIndex="1000"
            >
              Photo de la carte grise
            </FormLabel>
            <Box position="relative" height="100px">
              <Input
                type="file"
                opacity="0"
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                zIndex="2"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width="100%"
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
              >
                Cliquez ici pour ajouter une photo ou un PDF
              </Box>
            </Box>
          </FormControl>
        </GridItem>
      </Grid>

      <Box textAlign="right" mt="6">
        <Button colorScheme="blue" type="submit">
          Suivant
        </Button>
      </Box>
    </Box>
  );
}

export default Etape2;