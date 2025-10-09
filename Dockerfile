# Etapa 1: Build de producción
FROM node:22.17.0-alpine AS builder

WORKDIR /app

# Solo se parametriza AMBIENTE y su compilacion es:
# - development → MODE=development (build rápido)
# - testing/production → MODE=production (build optimizado )
ARG AMBIENTE=production

# Copia dependencias y core tgz
COPY package*.json ./
COPY ./consalud-core-1.0.0.tgz ./

# Instala dependencias exactas
RUN npm ci --no-audit --no-fund

# Copia el resto del código fuente
COPY . .

# Determinar el MODE según el AMBIENTE
# Vite usa --mode para cargar el archivo .env correspondiente
# - development → .env.development (compilación dev)
# - testing → .env.test (compilación production)
# - production → .env.production (compilación production)
RUN if [ "$AMBIENTE" = "development" ]; then \
      export BUILD_MODE="development"; \
    elif [ "$AMBIENTE" = "testing" ]; then \
      export BUILD_MODE="test"; \
    else \
      export BUILD_MODE="production"; \
    fi && \
    echo "=== BUILD INFO ===" && \
    echo "AMBIENTE: $AMBIENTE" && \
    echo "BUILD_MODE: $BUILD_MODE" && \
    echo "=== ARCHIVO .env QUE USARÁ VITE ===" && \
    echo ".env.$BUILD_MODE" && \
    if [ -f ".env.$BUILD_MODE" ]; then \
      head -5 ".env.$BUILD_MODE"; \
    else \
      echo "ADVERTENCIA: No se encontró .env.$BUILD_MODE"; \
      ls -la .env* || echo "No hay archivos .env"; \
    fi

# Verifica que el paquete está instalado
RUN ls -l node_modules/@consalud/core || (echo "NO SE INSTALO @consalud/core" && exit 1)

# Genera el build del frontend con el modo correspondiente
# testing y production usan compilación optimizada (terser, minify, sin sourcemaps)
# Solo development usa compilación rápida
RUN if [ "$AMBIENTE" = "development" ]; then \
      npm run build -- --mode development; \
    elif [ "$AMBIENTE" = "testing" ]; then \
      npm run build -- --mode test; \
    else \
      npm run build -- --mode production; \
    fi

# Etapa 2: Imagen final solo con archivos estáticos
FROM nginx:alpine AS production

# Copia el build generado al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
