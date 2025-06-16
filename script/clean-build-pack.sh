#!/bin/bash
set -e

# =============================
# Script: clean-build-pack.sh
# Descripción: Limpia dependencias, cachés y build, reinstala dependencias, corre tests y compila el proyecto.
# Permite flags para controlar el borrado de lockfiles, limpieza de caché y ejecución de tests/build.
# Uso:
#   ./clean-build-pack.sh [--no-test] [--no-build] [--clean-cache] [--remove-lockfiles]
# =============================

# Opciones por defecto
RUN_TESTS=true         # Ejecutar tests por defecto
RUN_BUILD=true         # Ejecutar build por defecto
CLEAN_CACHE=false      # No limpiar caché npm por defecto
REMOVE_LOCKFILES=false # No eliminar lockfiles por defecto

# Parsear argumentos
for arg in "$@"; do
  case $arg in
    --no-test) RUN_TESTS=false ;;
    --no-build) RUN_BUILD=false ;;
    --clean-cache) CLEAN_CACHE=true ;;
    --remove-lockfiles) REMOVE_LOCKFILES=true ;;
  esac
done

# 1. Limpiar dependencias y cachés locales
#    Elimina node_modules, carpetas de build y cachés de herramientas comunes
rm -rf node_modules dist build .turbo .next .cache

# 2. Eliminar lockfiles (opcional, solo si se pasa el flag)
if [ "$REMOVE_LOCKFILES" = true ]; then
  rm -f package-lock.json yarn.lock pnpm-lock.yaml
fi

# 3. Limpiar caché de npm (opcional, solo si se pasa el flag)
if [ "$CLEAN_CACHE" = true ]; then
  npm cache clean --force
fi

echo -e "\n[✔] Cachés y dependencias eliminadas."

# 4. Instalar dependencias de forma limpia y reproducible
#    'npm ci' es más rápido y confiable que 'npm install' en entornos limpios
#    --no-audit y --no-fund para evitar mensajes innecesarios
npm ci --no-audit --no-fund

echo -e "\n[✔] Dependencias instaladas."

# 5. Ejecutar tests (opcional)
if [ "$RUN_TESTS" = true ]; then
  echo -e "\n[→] Ejecutando tests..."
  npm run test
fi

# 6. Compilar el proyecto (opcional)
if [ "$RUN_BUILD" = true ]; then
  echo -e "\n[→] Compilando proyecto..."
  npm run build
fi

echo -e "\n[✔] Proceso completado. El paquete está listo para publicar o compartir." 