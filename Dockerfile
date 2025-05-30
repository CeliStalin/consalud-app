# Multi-stage build para optimización
# ESTE ARCHIVO SE EJECUTA AUTOMÁTICAMENTE cuando ejecutas: docker-compose up app

# Etapa base con Alpine
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Etapa 1: Optimización de dependencias - optimize-deps.js
# PASO 1: Se ejecuta automáticamente durante el build
FROM base AS optimizer
WORKDIR /app

# Copiar archivos necesarios para optimización
COPY package*.json ./
COPY optimization.config.ts ./
COPY scripts/ ./scripts/

# AQUÍ SE EJECUTA LA OPTIMIZACIÓN AUTOMÁTICAMENTE
# Este script se ejecuta UNA VEZ durante la construcción de la imagen
RUN node scripts/optimize-deps.js

# Etapa 2: Dependencias de desarrollo
# PASO 2: Instala todas las dependencias para desarrollo
FROM base AS deps-dev
WORKDIR /app

# Copiar archivos de paquete
COPY package*.json ./
COPY ./consalud-core-1.0.0.tgz ./

# Instalar TODAS las dependencias para desarrollo
RUN npm ci --no-audit --no-fund

# Etapa 3: Dependencias de producción
# PASO 3: Instala solo dependencias optimizadas para producción
FROM base AS deps-prod
WORKDIR /app

# Copiar el package.json optimizado desde la etapa optimizer
COPY --from=optimizer /app/package.prod.json ./package.json
COPY ./consalud-core-1.0.0.tgz ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production --no-audit --no-fund

# Etapa 4: Desarrollo (tu caso actual)
# PASO 4: Crea la imagen final para desarrollo
FROM base AS development
WORKDIR /app

# Copiar dependencias completas para desarrollo
COPY --from=deps-dev /app/node_modules ./node_modules
COPY package*.json ./
COPY ./consalud-core-1.0.0.tgz ./

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S reactgroup && \
    adduser -S reactuser -u 1001 -G reactgroup && \
    chown -R reactuser:reactgroup /app

USER reactuser

EXPOSE 5173

# COMANDO FINAL: Ejecuta la aplicación en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Etapa 5: Producción optimizada
# PASO 5: Crea la imagen final para producción (solo si usas --target production)
FROM base AS production
WORKDIR /app

# Copiar SOLO dependencias de producción optimizadas
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=optimizer /app/package.prod.json ./package.json

# Copiar código fuente necesario
COPY . .

# Build de la aplicación 
# RUN npm run build

# Crear usuario no-root
RUN addgroup -g 1001 -S reactgroup && \
    adduser -S reactuser -u 1001 -G reactgroup && \
    chown -R reactuser:reactgroup /app

USER reactuser

EXPOSE 3000

# COMANDO FINAL: Ejecuta la aplicación en modo producción
CMD ["npm", "start"]
