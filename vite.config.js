import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // NavBar.module.css + .explorerRoot -> "NavBar_explorerRoot__a1b2c"
      generateScopedName: '[name]_[local]__[hash:base64:5]',
    },
  },
})
