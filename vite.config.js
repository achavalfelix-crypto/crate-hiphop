import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// En local, atiende /api/spotify con la misma función que usa Vercel,
// así `npm run dev` funciona igual que la página publicada.
function apiLocal() {
  return {
    name: 'api-local',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), 'SPOTIFY_')
      Object.assign(process.env, env)
      server.middlewares.use('/api/spotify', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/spotify.js')
        const query = Object.fromEntries(new URL(req.url, 'http://local').searchParams)
        const respuesta = {
          status(c) { res.statusCode = c; return respuesta },
          setHeader(k, v) { res.setHeader(k, v); return respuesta },
          json(o) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return respuesta },
        }
        await handler({ query }, respuesta)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiLocal()],
})
