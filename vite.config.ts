import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': `http://127.0.0.1:${process.env.SSS_API_PORT ?? 8787}` },
    fs: { deny: ['.env', '.env.*', '*.pem', '**/.local/**', '**/server/**', '**/tests/**', '**/docs/**', '**/src/domain/fixtures.ts', '**/src/domain/store.ts', '**/src/services/mock.ts'] },
  },
})
