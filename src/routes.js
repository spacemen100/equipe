import React from "react";
import { Icon } from "@chakra-ui/react";
import { FcSelfie, FcCalendar, FcDocument, FcConferenceCall, FcPackage, FcSettings, FcMenu, FcSerialTasks } from "react-icons/fc";
import GestionOperationnelle from "views/admin/GestionOperationnelle";
import EmploiDuTemps from "views/admin/EmploiDuTemps";
import Documents from "views/admin/Documents";
import Communication from "views/admin/Communication";
import Materiels from "views/admin/Materiel";
import Parametres from "views/admin/Parametres";
import Menu from "views/admin/Menu"; 
import ChatComponent from "views/admin/ChatComponent";

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
  {
    name: "Communication",
    layout: "/admin",
    path: "/communication",
    icon: <Icon as={FcConferenceCall} width='20px' height='20px' color='inherit' />,
    component: Communication,
  },
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
    icon: <Icon as={FcSerialTasks} width='20px' height='20px' color='inherit' />, 
    component: ChatComponent,
  },
];

export default routes;
