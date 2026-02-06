import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Define a porta fixa aqui
    strictPort: true, // Se a 5174 estiver ocupada, ele não pula para a 5175
  }
})

