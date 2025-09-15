# ====== Etapa de build (con dev deps) ======
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos manifiestos primero para cache eficiente
COPY package*.json ./

# Usamos npm install (no npm ci) para evitar lockfile mismatch
RUN npm install

# Copiamos el resto del código
COPY . .

# Si usas TypeScript, compila a /app/dist (si no usas TS no pasa nada)
# Asegúrate de tener "build": "tsc" en package.json si es TS
RUN npm run build || echo "No build step, skipping"

# Dejamos solo dependencias de producción para el runtime
RUN npm prune --omit=dev

# ====== Etapa de runtime mínima ======
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copiamos solo lo necesario del build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Si compilas TS, copia /dist; si no, copia /src y ajusta el CMD más abajo
# Por defecto asumimos que sí hay build a dist:
COPY --from=build /app/dist ./dist

# Render inyecta $PORT; tu app debe escuchar process.env.PORT
EXPOSE 10000

# Si compilas TS, el entrypoint suele ser dist/index.js o dist/server.js.
# Ajusta la ruta si tu archivo es otro.
CMD ["node", "dist/index.js"]
