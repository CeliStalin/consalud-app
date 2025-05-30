#!/bin/bash

# Script para manejo de contenedores Docker - App Herederos
# Uso: ./docker-scripts.sh [comando]

PROJECT_NAME="consalud/mantherederos"

case "$1" in
  "dev")
    echo "🚀 Iniciando ambiente de DESARROLLO..."
    echo "📍 Acceso: http://localhost:5173"
    docker-compose up app --build
    ;;
  "dev-bg")
    echo "🚀 Iniciando ambiente de DESARROLLO (background)..."
    echo "📍 Acceso: http://localhost:5173"
    docker-compose up -d app --build
    ;;
  "prod")
    echo "🏭 Iniciando ambiente de PRODUCCIÓN..."
    echo "📍 Acceso: http://localhost:3000"
    docker-compose --profile production up app-prod --build -d
    ;;
  "test")
    echo "🧪 Iniciando ambiente de TESTING..."
    echo "📍 Acceso: http://localhost:4173"
    docker-compose --profile test up app-test --build
    ;;
  "build-dev")
    echo "🔨 Construyendo imagen de DESARROLLO..."
    docker build --target development -t ${PROJECT_NAME}:dev .
    ;;
  "build-prod")
    echo "🔨 Construyendo imagen de PRODUCCIÓN..."
    docker build --target production -t ${PROJECT_NAME}:prod .
    ;;
  "build-all")
    echo "🔨 Construyendo TODAS las imágenes..."
    docker build --target development -t ${PROJECT_NAME}:dev .
    docker build --target production -t ${PROJECT_NAME}:prod .
    echo "✅ Todas las imágenes construidas"
    ;;
  "logs")
    echo "📋 Mostrando logs..."
    docker-compose logs -f app
    ;;
  "status")
    echo "📊 Estado de contenedores:"
    docker-compose ps
    ;;
  "clean")
    echo "🧹 Limpiando contenedores e imágenes..."
    docker-compose down
    docker system prune -f
    ;;
  "stop")
    echo "⏹️ Deteniendo todos los servicios..."
    docker-compose down
    ;;
  "restart")
    echo "🔄 Reiniciando servicios..."
    docker-compose down
    docker-compose up app --build
    ;;
  *)
    echo "🐳 Docker Scripts para App Herederos"
    echo "Uso: $0 {comando}"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev        - Ambiente de desarrollo con hot-reload (puerto 5173)"
    echo "  dev-bg     - Desarrollo en background"
    echo "  prod       - Ambiente de producción (puerto 3000)"
    echo "  test       - Ambiente de testing (puerto 4173)"
    echo "  build-dev  - Construir imagen de desarrollo"
    echo "  build-prod - Construir imagen de producción"
    echo "  build-all  - Construir todas las imágenes"
    echo "  logs       - Ver logs en tiempo real"
    echo "  status     - Ver estado de contenedores"
    echo "  clean      - Limpiar contenedores e imágenes"
    echo "  stop       - Detener todos los servicios"
    echo "  restart    - Reiniciar servicios"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev     # Iniciar desarrollo"
    echo "  $0 prod    # Iniciar producción"
    echo "  $0 logs    # Ver logs"
    echo "  $0 stop    # Parar todo"
    exit 1
    ;;
esac
