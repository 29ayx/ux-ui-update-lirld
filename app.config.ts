import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "firebase/app": path.resolve(process.cwd(), "./src/lib/mockFirebase.ts"),
        "firebase/firestore": path.resolve(process.cwd(), "./src/lib/mockFirebase.ts"),
        "firebase/auth": path.resolve(process.cwd(), "./src/lib/mockFirebase.ts"),
        "firebase/storage": path.resolve(process.cwd(), "./src/lib/mockFirebase.ts"),
        "firebase/functions": path.resolve(process.cwd(), "./src/lib/mockFirebase.ts"),
      }
    },
    server: {
      host: true,
      strictPort: false,
      allowedHosts: ["dev.lirld.com"]
    }
  }
});

