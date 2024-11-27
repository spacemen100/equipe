import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'protectosystem.fr',
  appName: 'protecto',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
    // Ajoutez d'autres configurations de plugins si nécessaire
  }
};

export default config;
