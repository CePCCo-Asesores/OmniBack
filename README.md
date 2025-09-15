
---

## Requisitos
- Node.js 20+
- Cuenta de **Google Cloud Console** para OAuth (OAuth consent + OAuth client ID).
- (Opcional) Base de datos **PostgreSQL** (Railway/Render/etc.).

---

## Variables de entorno

### Rápido (usa los .env de ejemplo)

- **Backend**: copia `backend/.env.example` → `backend/.env` y ajusta:
  - `PUBLIC_URL` (URL del frontend)
  - `BACKEND_URL` (URL del backend)
  - `ALLOWED_ORIGIN` (coma-separado con todos los orígenes permitidos)
  - `SESSION_SECRET` (fuerte)
  - `JWT_SECRET` (fuerte) y `JWT_EXPIRES_IN` (p. ej. `7d`)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,  
    `GOOGLE_CALLBACK_URL` (ej: `http://localhost:8080/auth/google/callback`)
  - (Opcional) `DATABASE_URL`

- **Frontend**: copia `frontend/.env.example` → `frontend/.env` y ajusta:
  - CRA: `REACT_APP_BACKEND_URL=http://localhost:8080`
  - `PUBLIC_URL=http://localhost:3000`

> También tienes un `.env.example` **consolidado** en la raíz a modo de referencia.

---

## Primer arranque (local)

### Backend
```bash
cd backend
npm ci
# Dependencias adicionales típicas (si faltan)
# npm i helmet express-session compression cookie-parser cors pino pino-http uuid express-rate-limit pg zod
# npm i -D @types/express-session @types/cookie-parser @types/pg

npm run build
npm start
# Servirá en http://localhost:8080
