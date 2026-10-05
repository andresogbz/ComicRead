import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comicread.app',
  appName: 'OGMIC',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
