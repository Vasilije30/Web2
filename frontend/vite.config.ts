import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Binduje na sve mrežne interfejse (ne samo localhost) da bi dev server bio
    // dostupan sa drugih uređaja na istoj mreži (npr. telefon preko LAN IP adrese).
    host: true,
  },
})
