import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  FcBusinessman,
  FcLock,
  FcMindMap,
  FcFinePrint,
  FcSerialTasks,
  FcSurvey,
  FcSettings,
} from "react-icons/fc";
import VideoChatRoom from "views/admin/videoChatRoom";
// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/dataTables";
import RTL from "views/admin/rtl";
import Documentation from "views/admin/documentation"; 

// Auth Imports
import SignInCentered from "views/auth/signIn";
import Parameters from "views/admin/Parameters";

const routes = [
  {
    name: "Ecran principal",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={FcSurvey} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Carte",
    layout: "/admin",
    path: "/map",
    icon: <Icon as={FcMindMap} width='20px' height='20px' color='inherit' />,
    component: NFTMarketplace,
    secondary: true,
  },
  {
    name: "Tableau de bord",
    layout: "/admin",
    path: "/data-tables",
    icon: <Icon as={FcSerialTasks} width='20px' height='20px' color='inherit' />,
    component: DataTables,
  },
  {
    name: "Profile des utilisateur",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={FcBusinessman} width='20px' height='20px' color='inherit' />,
    component: Profile,
  },
  {
    name: "Login",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={FcLock} width='20px' height='20px' color='inherit' />,
    component: SignInCentered,
  },
  {
    name: "Paramètres",
    layout: "/admin",
    path: "/parameters",
    icon: <Icon as={FcSettings} width='20px' height='20px' color='inherit' />,
    component: Parameters, 
  },
  {
    name: "Vue d'ensemble administrateur",
    layout: "/admin",
    path: "/overview",
    icon: <Icon as={FcFinePrint} width='20px' height='20px' color='inherit' />,
    component: RTL,
  },
  {
    name: "Ajouter Documentation",
    layout: "/admin",
    path: "/documentation",
    icon: <Icon as={FcLock} width='20px' height='20px' color='inherit' />, // Replace with appropriate icon
    component: Documentation, // Replace with your Documentation component
  },
  {
    name: "Salle de chat vidéo",
    layout: "/admin",
    path: "/video-chat",
    icon: <Icon as={FcBusinessman} width='20px' height='20px' color='inherit' />, // Replace with a suitable icon
    component: VideoChatRoom, // Your Video Chat Room component
  },
];

export default routes;
