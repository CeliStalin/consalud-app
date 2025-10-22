#!/bin/sh

# Script de entrada para inyectar variables de entorno en runtime
# Este script se ejecuta cada vez que el contenedor inicia

set -e

echo "Iniciando Runtime Configuracion"

# Archivo de configuración de runtime que será servido como /env-config.js
ENV_CONFIG_FILE="/usr/share/nginx/html/env-config.js"

# Crear el archivo con las variables de entorno
# Estas variables serán inyectadas desde Kubernetes (deployment.yaml)
cat > "$ENV_CONFIG_FILE" << EOF
// ESTE ARCHIVO ES GENERADO AUTOMÁTICAMENTE EN RUNTIME
// NO EDITAR MANUALMENTE - Se regenera cada vez que el contenedor inicia

window.__ENV__ = {
  // Ambiente
  VITE_AMBIENTE: '${VITE_AMBIENTE:-production}',
  
  // APIs
  VITE_API_ARQUITECTURA_URL: '${VITE_API_ARQUITECTURA_URL:-}',
  VITE_BFF_HEREDEROS_DNS: '${VITE_BFF_HEREDEROS_DNS:-}',
  VITE_BFF_HEREDEROS_API_KEY_HEADER: '${VITE_BFF_HEREDEROS_API_KEY_HEADER:-}',
  VITE_BFF_HEREDEROS_API_KEY_VALUE: '${VITE_BFF_HEREDEROS_API_KEY_VALUE:-}',
  
  // Sistema
  VITE_SISTEMA: '${VITE_SISTEMA:-ManHerederos}',
  VITE_NOMBRE_SISTEMA: '${VITE_NOMBRE_SISTEMA:-Administrador de Devolución a Herederos}',
  
  // Seguridad
  VITE_NAME_API_KEY: '${VITE_NAME_API_KEY:-}',
  VITE_KEY_PASS_API_ARQ: '${VITE_KEY_PASS_API_ARQ:-}',
  
  // Azure AD (MSAL)
  VITE_CLIENT_ID: '${VITE_CLIENT_ID:-}',
  VITE_AUTHORITY: '${VITE_AUTHORITY:-}',
  VITE_REDIRECT_URI: '${VITE_REDIRECT_URI:-}',
  
  // Timeout
  VITE_TIMEOUT: '${VITE_TIMEOUT:-30000}'
};

// Congelar el objeto para prevenir modificaciones
Object.freeze(window.__ENV__);
EOF

echo "env-config.js generado exitosamente"
echo "Variables configuradas:"
echo "   - AMBIENTE: ${VITE_AMBIENTE:-production}"
echo "   - SISTEMA: ${VITE_NOMBRE_SISTEMA:-N/A}"
echo "   - API_URL: ${VITE_API_ARQUITECTURA_URL:-N/A}"
echo "   - BFF_URL: ${VITE_BFF_HEREDEROS_DNS:-N/A}"

# Iniciar nginx
echo "Iniciando servidor nginx..."
exec nginx -g "daemon off;"
