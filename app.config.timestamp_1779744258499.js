// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var app_config_default = defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "firebase/app": path.resolve(__dirname, "./src/lib/mockFirebase.ts"),
        "firebase/firestore": path.resolve(__dirname, "./src/lib/mockFirebase.ts"),
        "firebase/auth": path.resolve(__dirname, "./src/lib/mockFirebase.ts"),
        "firebase/storage": path.resolve(__dirname, "./src/lib/mockFirebase.ts"),
        "firebase/functions": path.resolve(__dirname, "./src/lib/mockFirebase.ts")
      }
    },
    server: {
      host: true,
      strictPort: false,
      allowedHosts: ["dev.lirld.com"]
    }
  }
});
export {
  app_config_default as default
};
