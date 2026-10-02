import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), 
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'flowpipe-editor'
        }
      }
    })
  ],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    },
  },
})
