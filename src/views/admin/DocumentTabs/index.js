import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Icon, Box } from "@chakra-ui/react";
import { FcMoneyTransfer, FcDiploma2, FcDocument } from "react-icons/fc";
import IncidentReportForm from "views/admin/IncidentReportForm";
import NoteDeFrais from "views/admin/NoteDeFrais";
import FicheBilanSUAP from "views/admin/FicheBilanSUAP";
import Documents from "views/admin/Documents";

const DocumentTabs = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabClick = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <Tabs index={tabIndex} onChange={handleTabClick} variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FcDiploma2} mr={2} />
            Notes de Frais
          </Tab>
          <Tab>
            <Icon as={FcDocument} mr={2} />
            Rapport d'incident
          </Tab>
          <Tab>
            <Icon as={FcDocument} mr={2} />
            Fiche Bilan SUAP
          </Tab>
          <Tab>
            <Icon as={FcMoneyTransfer} mr={2} />
            Liste des documents
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <NoteDeFrais />
          </TabPanel>
          <TabPanel>
            <IncidentReportForm />
          </TabPanel>
          <TabPanel>
            <FicheBilanSUAP />
          </TabPanel>
          <TabPanel>
            <Documents />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DocumentTabs;
