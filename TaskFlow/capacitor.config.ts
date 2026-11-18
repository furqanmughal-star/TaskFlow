import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.furqan.taskflow',
  appName: 'TaskFlow',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  backgroundColor: '#0f172a',
};

export default config;
