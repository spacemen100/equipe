// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import 'assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import RtlLayout from 'layouts/rtl';
import { GPSPositionProvider } from './GPSPositionContext'; 
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import { ThemeEditorProvider } from '@hypertheme-editor/chakra-ui';
import { EventProvider } from './EventContext';
import { TeamProvider, useTeam } from './views/admin/InterfaceEquipe/TeamContext';
import GpsPositionSimplified from './views/admin/InterfaceEquipe/components/GpsPositionSimplified';
import { MediaProvider } from './MediaContext';
import TeamSelectionModal from './TeamSelectionModal';
import { UnreadMessagesProvider } from './UnreadMessagesContext'; // Importer le contexte pour les messages non lus

const App = () => {
  const { selectedTeam } = useTeam(); // Assuming useTeam provides the selected team's UUID

  return (
    <UnreadMessagesProvider selectedTeam={selectedTeam}>
      <GpsPositionSimplified />
      <TeamSelectionModal /> {/* Afficher le modal au démarrage */}
      <Switch>
        <Route path={`/auth`} component={AuthLayout} />
        <Route path={`/admin`} component={AdminLayout} />
        <Route path={`/rtl`} component={RtlLayout} />
        <Redirect from='/' to='/admin' />
      </Switch>
    </UnreadMessagesProvider>
  );
};

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <TeamProvider>
      <EventProvider>
        <React.StrictMode>
          <GPSPositionProvider>
            <ThemeEditorProvider>
              <MediaProvider>
                <HashRouter>
                  <App />
                </HashRouter>
              </MediaProvider>
            </ThemeEditorProvider>
          </GPSPositionProvider>
        </React.StrictMode>
      </EventProvider>
    </TeamProvider>
  </ChakraProvider>,
  document.getElementById('root')
);
