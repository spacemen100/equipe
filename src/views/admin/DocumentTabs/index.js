import React, { useEffect, useCallback } from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Icon, Box } from "@chakra-ui/react";
import { FcMoneyTransfer, FcDiploma2, FcDocument } from "react-icons/fc";
import { useHistory, useLocation } from "react-router-dom";
import IncidentReportForm from "views/admin/IncidentReportForm";
import NoteDeFrais from "views/admin/NoteDeFrais";
import FicheBilanSUAP from "views/admin/FicheBilanSUAP";
import Documents from "views/admin/Documents";

const DocumentTabs = () => {
  const history = useHistory();
  const location = useLocation();

  const determineActiveIndex = useCallback(() => {
    switch (location.pathname) {
      case "/admin/note-de-frais":
        return 0;
      case "/admin/rapport-incident":
        return 1;
      case "/admin/fiche-bilan-suap":
        return 2;
      case "/admin/documents":
        return 3;
      default:
        return 0;
    }
  }, [location.pathname]);

  const [tabIndex, setTabIndex] = React.useState(determineActiveIndex());

  useEffect(() => {
    setTabIndex(determineActiveIndex());
  }, [location.pathname, determineActiveIndex]);

  const handleTabClick = (index, path) => {
    setTabIndex(index);
    history.push(path);
  };

  return (
    <Box pt={{ base: '180px', md: '80px', xl: '80px' }}>
    <Tabs index={tabIndex} variant="soft-rounded" colorScheme="blue">
      <TabList>
        <Tab onClick={() => handleTabClick(0, "/admin/note-de-frais")}>
          <Icon as={FcDiploma2} mr={2} />
          Notes de Frais
        </Tab>
        <Tab onClick={() => handleTabClick(1, "/admin/rapport-incident")}>
          <Icon as={FcDocument} mr={2} />
          Rapport d'incident
        </Tab>
        <Tab onClick={() => handleTabClick(2, "/admin/fiche-bilan-suap")}>
          <Icon as={FcDocument} mr={2} />
          Fiche Bilan SUAP
        </Tab>
        <Tab onClick={() => handleTabClick(3, "/admin/documents")}>
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
