import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_ROUTER=memory builds the single-file preview: every image is inlined into the bundle.
const singleFile = process.env.VITE_ROUTER === 'memory'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: singleFile ? { assetsInlineLimit: 100_000_000 } : {},
})
