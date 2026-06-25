import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cu.viajes.portal',
  appName: 'Viajes Cuba',
  webDir: 'dist/apps/portal/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
