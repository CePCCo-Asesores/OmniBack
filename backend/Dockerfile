# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine AS build

# 1) Dependencias del SO (opcionales pero útiles p/ builds nativos y healthchecks)
RUN apk add --no-cache python3 make g++ git

# 2) Seguridad básica: usuario no root
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
USER app

# 3) Copiamos manifiestos primero para cache de npm
COPY --chown=app:app package*.json ./

# 4) Instalación resiliente:
#    - Primero intentamos npm ci (rápido/determinista si el lockfile está bien)
#    - Si falla por mismatch, hacemos fallback a npm install
RUN npm ci || npm install

# 5) Copiamos el resto del código
COPY --chown=app:app . .

# 6) Compilar TypeScript -> dist (si falla, aborta build)
RUN npm run build

# 7) Dejar solo dependencias de producción para runtime
RUN npm prune --omit=dev


# =========================
# Stage 2: Runtime
# =========================
FROM node:20-alpine AS runtime

# Instalo curl para healthcheck (ligero en Alpine)
RUN apk add --no-cache curl

# Usuario no root consistente
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
USER app

# Variables recomendadas
ENV NODE_ENV=production
# Render inyecta PORT, pero exponemos 10000 como valor por defecto/documentación
ENV PORT=10000

# Copiamos sólo lo necesario del build
COPY --chown=app:app --from=build /app/package*.json ./
COPY --chown=app:app --from=build /app/node_modules ./node_modules
COPY --chown=app:app --from=build /app/dist ./dist

# Puerto informativo (Render ignora EXPOSE para el binding real, pero es útil)
EXPOSE 10000

# Healthcheck interno contra /health
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD \
  curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1

# Arranque
CMD ["node", "dist/index.js"]
