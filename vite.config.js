import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import proxyPlugin from './vite-proxy-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    proxyPlugin('https://www.costplusdrugs.com'),
  ],
})
