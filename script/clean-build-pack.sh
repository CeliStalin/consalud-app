#!/bin/bash
set -e

# Limpiar dependencias y cachés
rm -rf node_modules dist build .turbo .next .cache

# NO eliminar el package-lock.json ni los lockfiles para builds reproducibles
# Si necesitas forzar la actualización de dependencias (por ejemplo, tras cambiar versiones en package.json),
# puedes eliminar manualmente el lockfile y luego correr este script, pero NO es lo recomendado para builds normales.
rm -f package-lock.json yarn.lock pnpm-lock.yaml  # <- Solo descomentar si realmente quieres regenerar todo

# Limpiar caché de npm
npm cache clean --force

echo "\n[✔] Cachés y dependencias eliminadas."

echo "\n[→] Instalando dependencias..."
npm install

echo "\n[→] Compilando proyecto..."
npm run build




#!/bin/bash
#set -e

#echo "[→] Iniciando limpieza del proyecto..."

# Limpiar dependencias y cachés
#rm -rf node_modules dist build .turbo .next .cache

# Mantener el package-lock.json para builds reproducibles
# NO descomentar la siguiente línea a menos que sea absolutamente necesario
# rm -f package-lock.json yarn.lock pnpm-lock.yaml

# Limpiar caché de npm
#echo "[→] Limpiando caché de npm..."
#npm cache clean --force

#echo "[✔] Cachés y dependencias eliminadas."

#echo "[→] Instalando dependencias..."
#npm ci || npm install

# Solo ejecutar tests si vitest está instalado
#if [ -x "$(command -v vitest)" ]; then
#    echo "[→] Ejecutando tests..."
#    npm run test
#else
#    echo "[!] Vitest no está instalado. Saltando tests..."
#fi

#echo "[→] Compilando proyecto..."
#npm run build

#echo "[✔] Proceso completado exitosamente."

