import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',     // Permite conexiones desde la red local (teléfono, etc.)
    port: 5173,
    allowedHosts: true    // Permite cualquier host (útil para pruebas en LAN)
  },
})
