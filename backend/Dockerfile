# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS build

# Dependencias útiles para builds nativos
RUN apk add --no-cache python3 make g++ git

# Usuario no-root
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
USER app

# Manifiestos primero para cache
COPY --chown=app:app package*.json ./

# Instalación resiliente: si el lockfile no coincide, cae a npm install
RUN npm ci || npm install

# Código
COPY --chown=app:app . .

# Compilar TS -> dist (si falla, que truene el build)
RUN npm run build

# Dejar sólo deps de producción
RUN npm prune --omit=dev


# =========================
# Etapa de runtime
# =========================
FROM node:20-alpine AS runtime

# Utilidad para healthcheck
RUN apk add --no-cache curl

# Usuario no-root
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
USER app

ENV NODE_ENV=production
# Render inyecta PORT; exponemos 10000 de referencia
ENV PORT=10000

# Copiamos sólo lo necesario
COPY --chown=app:app --from=build /app/package*.json ./
COPY --chown=app:app --from=build /app/node_modules ./node_modules
COPY --chown=app:app --from=build /app/dist ./dist

EXPOSE 10000

# Healthcheck contra /health
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD \
  curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1

CMD ["node", "dist/index.js"]
