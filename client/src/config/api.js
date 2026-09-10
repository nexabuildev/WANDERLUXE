// En local, VITE_API_URL no está definida y las peticiones quedan relativas
// ('/api/...'), que el proxy de Vite reenvía a http://localhost:3000.
// En producción (Cloudflare Pages) se define VITE_API_URL con la URL del
// backend en Render, para que el build apunte directamente ahí.
export const API_URL = import.meta.env.VITE_API_URL || '';
