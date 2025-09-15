import type { CorsOptions } from 'cors';

/**
 * Genera una lista blanca a partir de ALLOWED_ORIGIN (separado por comas).
 * Ej: "http://localhost:3000,https://app.tu-dominio.com"
 */
function getWhitelist(): string[] {
  const raw = process.env.ALLOWED_ORIGIN || '';
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = getWhitelist();

    // Permite herramientas locales sin origin
    if (!origin) return callback(null, true);

    if (whitelist.length === 0) {
      // Si no hay lista blanca configurada, bloquea todo excepto same-origin
      return callback(new Error('CORS: No ALLOWED_ORIGIN configured'), false);
    }

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
