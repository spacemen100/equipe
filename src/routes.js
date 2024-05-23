import React from "react";
import { Icon } from "@chakra-ui/react";
import {  FcSelfie } from "react-icons/fc";
import InterfaceEquipe from "views/admin/InterfaceEquipe";

const routes = [
  {
    name: "Interface Equipe",
    layout: "/admin",
    path: "/interface-equipe",
    icon: <Icon as={FcSelfie} width='20px' height='20px' color='inherit' />,
    component: InterfaceEquipe,
  },
];

export default routes;
