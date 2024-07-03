import React from "react";
import { Icon } from "@chakra-ui/react";
import { FcSelfie, FcCalendar, FcDocument, FcPackage, FcSettings, FcMenu, FcComments, FcEditImage, FcHighPriority } from "react-icons/fc";
import GestionOperationnelle from "views/admin/GestionOperationnelle";
import EmploiDuTemps from "views/admin/EmploiDuTemps";
import Documents from "views/admin/Documents";
//import Communication from "views/admin/Communication";
import Materiels from "views/admin/Materiel";
import Parametres from "views/admin/Parametres";
import Menu from "views/admin/Menu"; 
import ChatComponent from "views/admin/ChatComponent";
import IncidentReportForm from "views/admin/IncidentReportForm"; 
import FicheBilanSUAP from "views/admin/FicheBilanSUAP"; 
import NoteDeFrais from "views/admin/NoteDeFrais";
import SOSAlerteDanger from "views/admin/SOSAlerteDanger"; // Import the new component

const routes = [
  {
    name: "Menu",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={FcMenu} width='20px' height='20px' color='inherit' />,
    component: Menu,
  },
  {
    name: "Gestion opérationnelle",
    layout: "/admin",
    path: "/gestion-operationnelle",
    icon: <Icon as={FcSelfie} width='20px' height='20px' color='inherit' />,
    component: GestionOperationnelle,
  },
  {
    name: "Emploi du temps",
    layout: "/admin",
    path: "/emploi-du-temps",
    icon: <Icon as={FcCalendar} width='20px' height='20px' color='inherit' />,
    component: EmploiDuTemps,
  },
  {
    name: "Documents",
    layout: "/admin",
    path: "/documents",
    icon: <Icon as={FcDocument} width='20px' height='20px' color='inherit' />,
    component: Documents,
  },
//  {
  //  name: "Communication",
  //  layout: "/admin",
  //  path: "/communication",
  //  icon: <Icon as={FcConferenceCall} width='20px' height='20px' color='inherit' />,
  //  component: Communication,
  //  hide: true, // Add the hide property
//  },
  {
    name: "Matériels",
    layout: "/admin",
    path: "/materiels",
    icon: <Icon as={FcPackage} width='20px' height='20px' color='inherit' />,
    component: Materiels,
  },
  {
    name: "Paramètres",
    layout: "/admin",
    path: "/parametres",
    icon: <Icon as={FcSettings} width='20px' height='20px' color='inherit' />,
    component: Parametres,
  },
  {
    name: "Chat",
    layout: "/admin",
    path: "/chat",
    icon: <Icon as={FcComments} width='20px' height='20px' color='inherit' />, 
    component: ChatComponent,
  },
  {
    name: "Rapport d'incident",
    layout: "/admin",
    path: "/rapport-incident",
    icon: <Icon as={FcDocument} width='20px' height='20px' color='inherit' />,
    component: IncidentReportForm,
  },
  {
    name: "Fiche Bilan SUAP",
    layout: "/admin",
    path: "/fiche-bilan-suap",
    icon: <Icon as={FcDocument} width='20px' height='20px' color='inherit' />,
    component: FicheBilanSUAP,
  },
  {
    name: "Note de frais",
    layout: "/admin",
    path: "/note-de-frais",
    icon: <Icon as={FcEditImage} width='20px' height='20px' color='inherit' />,
    component: NoteDeFrais,
  },
  {
    name: "SOS Alerte Danger", // Add the new route here
    layout: "/admin",
    path: "/sos-alerte-danger",
    icon: <Icon as={FcHighPriority} width='20px' height='20px' color='inherit' />,
    component: SOSAlerteDanger,
  },
];

export default routes;
