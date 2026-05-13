import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "4ddb7f130baa.ngrok-free.app", // add your ngrok domain here
      "localhost",
      "127.0.0.1",
    ],
  },
});
