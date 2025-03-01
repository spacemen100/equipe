import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  FcCalendar,
  FcDocument,
  FcPackage,
  FcSettings,
  FcMenu,
  FcComments,
  FcEditImage,
  FcHighPriority,
  FcCameraIdentification
} from "react-icons/fc";
import { FaMapMarked } from "react-icons/fa"; // Import the map icon
import { GiWalkieTalkie } from "react-icons/gi"; // Import the walkie-talkie icon
//import GestionOperationnelle from "views/admin/GestionOperationnelle";
import EmploiDuTemps from "views/admin/EmploiDuTemps";
import Documents from "views/admin/Documents";
import Materiels from "views/admin/Materiel";
import Parametres from "views/admin/Parametres";
import Menu from "views/admin/Menu";
import ChatComponent from "views/admin/ChatComponent";
import IncidentReportForm from "views/admin/IncidentReportForm";
import FicheBilanSUAP from "views/admin/FicheBilanSUAP";
import NoteDeFrais from "views/admin/NoteDeFrais";
import SOSAlerteDanger from "views/admin/SOSAlerteDanger";
import MapComponent from "views/admin/MapComponent"; 
import DocumentTabs from "views/admin/DocumentTabs"; 
import ZoomedMapComponent from "views/admin/ZoomedMapComponent";
import VideoCaptureBisBis from 'views/admin/Materiel/components/VideoCaptureBisBis';
import TalkieWalkie from "views/admin/TalkieWalkie"; // Import the new component

const routes = [
  {
    name: "Menu",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={FcMenu} width='20px' height='20px' color='inherit' />,
    component: Menu,
  },
 // {
 //   name: "Géolocalisation",
 //   layout: "/admin",
 //   path: "/gestion-operationnelle",
 //   icon: <Icon as={BsGeoAltFill} width='20px' height='20px' color='inherit' />,
 //   component: GestionOperationnelle,
 // },
  {
    name: "Scanner QR Code",
    layout: "/admin",
    path: "/qr-scanner",
    icon: <Icon as={FcCameraIdentification} width='20px' height='20px' color='inherit' />,
    component: VideoCaptureBisBis,
    hide: true, // Optional: hide from the navigation menu if you don't want it displayed
  },
  {
    name: "Carte zoomée",
    layout: "/admin",
    path: "/zoomed-map",
    component: ZoomedMapComponent,
  },
  {
    name: "Emploi du temps",
    layout: "/admin",
    path: "/emploi-du-temps",
    icon: <Icon as={FcCalendar} width='20px' height='20px' color='inherit' />,
    component: EmploiDuTemps,
  },
  {
    name: "Documentss",
    layout: "/admin",
    path: "/documents",
    icon: <Icon as={FcDocument} width='20px' height='20px' color='inherit' />,
    component: Documents,
  },
  {
    name: "Documents", // New DocumentTabs route
    layout: "/admin",
    path: "/documents-tabs",
    icon: <Icon as={FcDocument} width='20px' height='20px' color='inherit' />,
    component: DocumentTabs, // Refer to the new DocumentTabs component
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
    name: "Chat",
    layout: "/admin",
    path: "/chat",
    icon: <Icon as={FcComments} width='20px' height='20px' color='inherit' />,
    component: ChatComponent,
  },
  {
    name: "Paramètres",
    layout: "/admin",
    path: "/parametres",
    icon: <Icon as={FcSettings} width='20px' height='20px' color='inherit' />,
    component: Parametres,
  },
  {
    name: "Matériels",
    layout: "/admin",
    path: "/materiels",
    icon: <Icon as={FcPackage} width='20px' height='20px' color='inherit' />,
    component: Materiels,
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
    name: "SOS Alerte Silencieuse",
    layout: "/admin",
    path: "/sos-alerte-danger",
    icon: <Icon as={FcHighPriority} width='20px' height='20px' color='inherit' />,
    component: SOSAlerteDanger,
  },
  {
    name: "Carte", // New map route
    layout: "/admin",
    path: "/carte",
    icon: <Icon as={FaMapMarked} width='20px' height='20px' color='inherit' />,
    component: MapComponent,
  },
  {
    name: "Talkie-Walkie", // New talkie-walkie route
    layout: "/admin",
    path: "/talkie-walkie",
    icon: <Icon as={GiWalkieTalkie} width='20px' height='20px' color='inherit' />,
    component: TalkieWalkie,
  },
];

export default routes;