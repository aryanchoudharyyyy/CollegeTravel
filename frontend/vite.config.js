import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // if (command === 'build' && mode === 'production') {
  //   const env = loadEnv(mode, process.cwd(), 'VITE_')
  //   const apiBaseUrl = env.VITE_API_BASE_URL
  //   const websocketUrl = env.VITE_WS_URL

  //   if (!apiBaseUrl || !websocketUrl) {
  //     throw new Error('Production builds require VITE_API_BASE_URL and VITE_WS_URL.')
  //   }

  //   let apiUrl
  //   let wsUrl
  //   try {
  //     apiUrl = new URL(apiBaseUrl)
  //     wsUrl = new URL(websocketUrl)
  //   } catch {
  //     throw new Error('Production API and WebSocket settings must be absolute URLs.')
  //   }

  //   if (apiUrl.protocol !== 'https:' || apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash) {
  //     throw new Error('VITE_API_BASE_URL must be an HTTPS origin without a path in production.')
  //   }
  //   if (wsUrl.protocol !== 'wss:' || wsUrl.pathname !== '/api/chat/ws' || wsUrl.search || wsUrl.hash) {
  //     throw new Error('VITE_WS_URL must use wss:// and end with /api/chat/ws in production.')
  //   }
  // }

  return {
    plugins: [react()],
  }
})
