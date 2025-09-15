# ====== Stage: build (root) ======
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos manifiestos y resolvemos deps
COPY package*.json ./
RUN npm install

# Copiamos el código y compilamos TS -> dist
COPY . .
RUN npm run build

# Dejamos sólo deps de producción para el runtime
RUN npm prune --omit=dev


# ====== Stage: runtime (no-root) ======
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup -S app && adduser -S app -G app

# Copiar artefactos del build y node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Cambiar a usuario no-root para ejecutar
USER app

# Render usará PORT; exponemos 10000 como referencia
EXPOSE 10000
CMD ["node", "dist/index.js"]
