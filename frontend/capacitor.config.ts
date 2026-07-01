import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.chatapp",
  appName: "Chat App",
  webDir: "dist",
  server: {
    // Allows the app to talk to your backend over plain HTTP during development.
    // Remove/tighten this once your backend is served over HTTPS in production.
    cleartext: true,
  },
};

export default config;
