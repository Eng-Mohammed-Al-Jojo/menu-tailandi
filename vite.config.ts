import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// MikroTik Hotspot: base must be './' so all asset paths are relative
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: './',
})
