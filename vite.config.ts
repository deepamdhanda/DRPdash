import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '4ddb7f130baa.ngrok-free.app', // add your ngrok domain here
      'localhost',
      '127.0.0.1',
    ],
  },
})
