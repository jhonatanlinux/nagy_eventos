import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "art.foxsolucoes.nagyeventos",
  appName: "NAGY EVENTOS",
  webDir: "dist",
  backgroundColor: "#090605",
  android: {
    backgroundColor: "#090605",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#090605",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#090605",
      overlaysWebView: false,
    },
  },
};

export default config;
