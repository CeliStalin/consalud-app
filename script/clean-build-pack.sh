#!/bin/bash
set -e

# Limpiar dependencias y cachés
rm -rf node_modules dist build .turbo .next .cache

# Eliminar lockfiles (opcional, descomenta si lo deseas siempre)
rm -f package-lock.json yarn.lock pnpm-lock.yaml

# Limpiar caché de npm
npm cache clean --force

echo "\n[✔] Cachés y dependencias eliminadas."

echo "\n[→] Instalando dependencias..."
npm install

echo "\n[→] Ejecutando tests..."
npm run test

echo "\n[→] Compilando proyecto..."
npm run build
        
echo "\n[✔] Proceso completado. El paquete está listo para publicar o compartir." 