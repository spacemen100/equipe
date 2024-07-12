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
import { TeamProvider } from './views/admin/InterfaceEquipe/TeamContext';
import GpsPositionSimplified from './views/admin/InterfaceEquipe/components/GpsPositionSimplified';
import useGeolocation from './useGeolocation';

const App = () => {
  useGeolocation(); // Hook to request geolocation permission

  return (
    <ChakraProvider theme={theme}>
      <EventProvider>
        <TeamProvider>
          <React.StrictMode>
            <GPSPositionProvider>
              <ThemeEditorProvider>
                <HashRouter>
                  <GpsPositionSimplified />
                  <Switch>
                    <Route path={`/auth`} component={AuthLayout} />
                    <Route path={`/admin`} component={AdminLayout} />
                    <Route path={`/rtl`} component={RtlLayout} />
                    <Redirect from='/' to='/admin' />
                  </Switch>
                </HashRouter>
              </ThemeEditorProvider>
            </GPSPositionProvider>
          </React.StrictMode>
        </TeamProvider>
      </EventProvider>
    </ChakraProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
