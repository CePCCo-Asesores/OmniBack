# =========
# 1) Deps
# =========
FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci

# =========
# 2) Build
# =========
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variables de build opcionales para inyectar versión/sha/tiempo en el binario
ARG APP_VERSION=0.0.0
ARG GIT_SHA=dev
ARG BUILD_TIME=local
# Opcionalmente exponerlas al runtime via .env o process.env (aquí quedan en la imagen)
ENV APP_VERSION=$APP_VERSION \
    GIT_SHA=$GIT_SHA \
    BUILD_TIME=$BUILD_TIME
# Compila TypeScript
RUN npm run build
# Prune de dependencias a production
RUN npm prune --omit=dev

# =============
# 3) Runtime
# =============
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Crea usuario no root
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Variables de entorno comunes (puedes sobreescribir en despliegue)
ENV PORT=8080
EXPOSE 8080

# Healthcheck simple (ajústalo a /health si lo prefieres)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT||8080) + '/health', r => { if (r.statusCode!==200) process.exit(1); }).on('error',()=>process.exit(1))"

USER app
# Importante: nuestro entrypoint unificado es server.ts → dist/server.js
CMD ["node","dist/server.js"]
