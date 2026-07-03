import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // proxy: {
    //   "/api": {
    //     // target: "https://enablement.orderzup.com",
    //     target: "http://localhost:5001",
    //     rewrite: (path) => path.replace(/^\/api/, ""),
    //     changeOrigin: true,
    //     // secure: true,
    //   },
    // },
    allowedHosts: [
      "4ddb7f130baa.ngrok-free.app", // add your ngrok domain here
      "localhost",
      "127.0.0.1",
    ],
  },
});