# Etapa 1: Build de producción
FROM node:22.17.0-alpine AS builder

WORKDIR /app

# Permite elegir el archivo de entorno y el modo de build
ARG ENV_FILE=.env.production
ARG MODE=production

# Copia dependencias y core tgz
COPY package*.json ./
COPY ./consalud-core-1.0.0.tgz ./

# Instala dependencias exactas
RUN npm ci --no-audit --no-fund

# Copia el resto del código fuente
COPY . .

# Copia el archivo de entorno seleccionado como .env para el build del frontend
COPY ${ENV_FILE} .env
RUN echo "=== CONTENIDO DE .env ===" && cat .env

# Verifica que el paquete está instalado
RUN ls -l node_modules/@consalud/core || (echo "NO SE INSTALO @consalud/core" && exit 1)

# Genera el build del frontend con el modo seleccionado
RUN npm run build -- --mode $MODE

# Etapa 2: Imagen final solo con archivos estáticos
FROM nginx:alpine AS production

# Copia el build generado al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 