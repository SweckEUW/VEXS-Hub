import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      'flowpipe-web-editor': path.resolve(__dirname, '../Flowpipe-Stuff/flowpipe-web-editor/src/index.ts')
    }
  },
  server: {
    fs: {
      allow: [
        '..',
        path.resolve(__dirname, '../Flowpipe-Stuff/flowpipe-web-editor')
      ]
    }
  }
})