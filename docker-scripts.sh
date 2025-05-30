#!/bin/bash

case "$1" in
  "dev")
    echo "🚀 Iniciando ambiente de DESARROLLO..."
    docker-compose up --build
    ;;
  "prod")
    echo "🏭 Iniciando ambiente de PRODUCCIÓN..."
    docker-compose --profile production up --build -d
    ;;
  "build-dev")
    echo "🔨 Construyendo imagen de DESARROLLO..."
    docker build --target development -t consalud-app:dev .
    ;;
  "build-prod")
    echo "🔨 Construyendo imagen de PRODUCCIÓN..."
    docker build --target production -t consalud-app:prod .
    ;;
  "stop")
    echo "⏹️ Deteniendo todos los servicios..."
    docker-compose down
    ;;
  *)
    echo "Uso: $0 {dev|prod|build-dev|build-prod|stop}"
    echo "  dev        - Ambiente de desarrollo con hot-reload"
    echo "  prod       - Ambiente de producción"
    echo "  build-dev  - Construir imagen de desarrollo"
    echo "  build-prod - Construir imagen de producción"
    echo "  stop       - Detener todos los servicios"
    exit 1
    ;;
esac
