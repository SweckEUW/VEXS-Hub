import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // Die Library ist per file:-Dependency verlinkt und bringt eigene node_modules mit -
    // ohne dedupe laufen zwei Vue-Instanzen im Browser.
    dedupe: ['vue', 'primevue']
  },
  // Verlinktes Paket nicht vorbuendeln, sonst friert Vite einen alten
  // build:watch-Stand im optimizeDeps-Cache ein.
  optimizeDeps: {
    exclude: ['flowpipe-web-editor']
  },
  server: {
    fs: {
      allow: [
        '..',
        // Vite muss durch den Symlink hinaus lesen duerfen.
        path.resolve(__dirname, '../Flowpipe-Stuff/flowpipe-web-editor')
      ]
    }
  }
})
