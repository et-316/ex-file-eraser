import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.deletemyex',
  appName: 'Delete My Ex',
  webDir: 'dist',
  // Commented out for native build - uncomment for hot-reload during development
  // server: {
  //   url: 'https://725b9661-eea8-4b25-a09a-83c136bbc0ec.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    Camera: {
      iosPermissions: {
        camera: 'This app needs camera access to take photos',
        photos: 'This app needs photo library access to select and manage photos'
      }
    }
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
