import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { main as fetchLumaEvents } from './scripts/fetch-events.mjs'

function lumaEvents() {
  return {
    name: 'she-ships-luma-events',
    async buildStart() {
      await fetchLumaEvents()
    },
  }
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [lumaEvents(), react()],
  css: {
    modules: {
      generateScopedName: '[name]_[local]__[hash:base64:5]',
    },
  },
})
