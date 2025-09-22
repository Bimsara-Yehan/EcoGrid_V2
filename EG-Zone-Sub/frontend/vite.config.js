import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/Zones': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
      '/api/subscriptions': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
      '/api/customers': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
