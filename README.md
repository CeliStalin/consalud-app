# Consalud App - Administrador de Devolución a Herederos

## 📋 Descripción

Aplicación web corporativa para la gestión y administración de devoluciones a herederos de Consalud. Esta aplicación permite el registro, seguimiento y gestión de documentos relacionados con el proceso de devolución de fondos a herederos.

## 🔧 Tecnologías principales

- **React 19** - Biblioteca para construir interfaces de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Herramienta de compilación y desarrollo
- **React Router v7** - Enrutamiento de la aplicación
- **MSAL** - Autenticación con Microsoft Azure AD
- **Bulma** - Framework CSS utilizado para la interfaz
- **@consalud/core** - Biblioteca de componentes core desarrollada internamente

## 🏗️ Estructura del proyecto

```
src/
├── assets/         # Imágenes y recursos estáticos
├── core/           # Componentes, hooks y servicios compartidos
├── features/       # Módulos funcionales específicos
│   ├── documentos/ # Gestión de documentos
│   └── herederos/  # Gestión de herederos
├── pages/          # Páginas principales de la aplicación
├── routes/         # Configuración de rutas
├── styles/         # Estilos CSS globales y variables
├── App.tsx         # Componente principal
└── main.tsx        # Punto de entrada
```

## 🚀 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://devops.consalud.net/Consalud/PlantillaReact/_git/app-herederos
   cd consalud-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

## 🔑 Autenticación

La aplicación utiliza autenticación mediante Azure AD a través de MSAL (Microsoft Authentication Library). El flujo de autenticación implementado es:

1. Redirección al inicio de sesión de Microsoft
2. Autenticación mediante credenciales corporativas
3. Redirección a la aplicación con el token correspondiente
4. Verificación de roles y permisos

## 🌐 Ambientes

La aplicación está configurada para trabajar en múltiples ambientes:

| Ambiente    | Comando                | Descripción                               |
|-------------|------------------------|-------------------------------------------|
| Desarrollo  | `npm run dev`          | Conecta a APIs de desarrollo              |
| Local       | `npm run dev:local`    | Configuraciones específicas para desarrollo local |
| Test        | `npm run build:test`   | Compilación para ambiente de pruebas (QA) |
| Producción  | `npm run build`        | Compilación para ambiente productivo      |

## 🛣️ Rutas

La aplicación implementa un sistema de rutas dinámico basado en los permisos del usuario. Las rutas principales son:

- `/login` - Página de inicio de sesión
- `/home` - Página principal tras el login
- `/mnherederos/ingresoher` - Ingreso de herederos (página principal del módulo de herederos)
- `/mnherederos/ingresoher/ingresotitular` - Ingreso de RUT del titular (carga `IngresoTitularPage`)
- `/mnherederos/ingresoher/cargadoc` - Ingreso de documentación (carga `IngresoDocumentosPage`)

## 📚 Librería Core

Esta aplicación utiliza `@consalud/core`, una librería interna que proporciona:

- Componentes base (Button, Card, Layout, etc.)
- Hooks personalizados (useAuth, useLocalStorage)
- Servicios comunes (autenticación, gestión de APIs)
- Utilidades y funciones helper

## 🔐 Variables de entorno

Las variables de entorno se definen en archivos `.env.*` para cada ambiente:

| Variable                      | Descripción                                |
|-------------------------------|--------------------------------------------|
| VITE_AMBIENTE                 | Nombre del ambiente actual                 |
| VITE_SISTEMA                  | Código del sistema                         |
| VITE_NOMBRE_SISTEMA           | Nombre completo del sistema                |
| VITE_API_ARQUITECTURA_URL     | URL de la API de arquitectura              |
| VITE_TIMEOUT                  | Tiempo de espera para peticiones API (ms)  |
| VITE_NAME_API_KEY             | Nombre del header para la API key          |
| VITE_KEY_PASS_API_ARQ         | API key para autenticación                 |
| VITE_CLIENT_ID                | ID de cliente para Azure AD                |
| VITE_AUTHORITY                | URL de autoridad para Azure AD             |
| VITE_REDIRECT_URI             | URI de redirección tras autenticación      |

## ⚠️ Requisitos

- Node.js 18.x o superior
- Acceso a la red corporativa de Consalud (o VPN)
- Cuenta de usuario en el directorio activo corporativo
- Tener asignado uno de los roles con acceso al sistema

## 🧪 Testing

Por implementar.

## 📝 Convenciones de código

- Componentes en PascalCase
- Hooks con prefijo `use`
- Interfaces con prefijo `I`
- Archivos TypeScript con extensión `.tsx` para componentes React, `.ts` para lógica

## 👨‍💻 Contribución

1. Crea una rama desde `develop`
2. Implementa tus cambios siguiendo las convenciones de código
3. Asegúrate de que la aplicación siga funcionando correctamente
4. Envía un pull request a `develop`

## 📄 Licencia

Este proyecto es propiedad de Consalud y es de uso interno. Todos los derechos reservados.

# Consalud App - Guía de Despliegue

Esta aplicación React con TypeScript está optimizada para ejecutarse en contenedores Docker con Alpine Linux.

## 📋 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+
- Servidor Unix/Linux
- 2GB de RAM disponible
- 10GB de espacio en disco

## 🚀 Instalación y Ejecución

### Opción 1: Desarrollo (Recomendado para desarrollo local)

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd consalud-app

# Construir y ejecutar en modo desarrollo
docker-compose up app

# O en background
docker-compose up -d app
```

**Acceso**: http://localhost:5173

### Opción 2: Producción Optimizada

```bash
# Construir y ejecutar en modo producción
docker-compose --profile production up app-prod

# O en background
docker-compose --profile production up -d app-prod
```

**Acceso**: http://localhost:3000

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Reconstruir imagen desde cero
docker-compose build --no-cache app

# Ver estado de contenedores
docker-compose ps
```

### Construcción Manual

```bash
# Desarrollo
docker build --target development -t consalud-app:dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules consalud-app:dev

# Producción
docker build --target production -t consalud-app:prod .
docker run -p 3000:3000 consalud-app:prod
```

### Optimización de Dependencias

```bash
# Ejecutar optimización manual (opcional)
node scripts/optimize-deps.js

# Ver diferencias de dependencias
ls -la package*.json
```

## 📁 Estructura del Proyecto

```
consalud-app/
├── Dockerfile                 # Multi-stage build optimizado
├── docker-compose.yml         # Configuración de servicios
├── optimization.config.ts     # Configuración de optimización
├── scripts/
│   └── optimize-deps.js      # Script de optimización de dependencias
├── package.json              # Dependencias completas
├── package.prod.json         # Dependencias de producción (auto-generado)
└── .dockerignore             # Archivos excluidos del build
```

## 🐳 Arquitectura Docker

### Multi-Stage Build

1. **Base**: Node 20 Alpine + herramientas de compilación
2. **Optimizer**: Ejecuta optimización de dependencias
3. **Deps-dev**: Instala todas las dependencias para desarrollo
4. **Deps-prod**: Instala solo dependencias de producción
5. **Development**: Imagen final para desarrollo
6. **Production**: Imagen final optimizada para producción

### Optimizaciones Aplicadas

- ✅ **Alpine Linux**: Reduce imagen base de 180MB a 5MB
- ✅ **Multi-stage build**: Separa dependencias dev/prod
- ✅ **Dependency optimization**: Elimina dependencias innecesarias
- ✅ **Layer caching**: Optimiza rebuild de imágenes
- ✅ **Security**: Usuario no-root
- ✅ **Health checks**: Monitoreo de salud del contenedor

## 🔍 Monitoreo y Troubleshooting

### Verificar Estado de la Aplicación

```bash
# Health check manual
curl http://localhost:5173/
curl http://localhost:3000/

# Ver logs específicos
docker logs consalud-app-dev
docker logs consalud-app-prod

# Entrar al contenedor para debugging
docker exec -it consalud-app-dev sh

# Ver uso de recursos
docker stats consalud-app-dev
```

### Problemas Comunes

#### Error: Puerto ya en uso
```bash
# Encontrar proceso usando el puerto
sudo lsof -i :5173
sudo lsof -i :3000

# Matar proceso
sudo kill -9 <PID>
```

#### Error: Sin espacio en disco
```bash
# Limpiar imágenes no utilizadas
docker system prune -a

# Ver uso de espacio de Docker
docker system df
```

#### Error: Dependencias faltantes
```bash
# Reconstruir sin cache
docker-compose build --no-cache app

# Verificar archivo de dependencias optimizado
cat package.prod.json
```

## 🔧 Configuración de Entorno

### Variables de Entorno

Crear archivo `.env` para configuración local:

```bash
# .env
NODE_ENV=development
VITE_API_URL=http://localhost:3001
VITE_HOST=0.0.0.0
```

### Configuración de Red

```bash
# Para acceso externo en servidor
docker run -p 0.0.0.0:5173:5173 consalud-app:dev

# Con docker-compose, editar ports en docker-compose.yml:
ports:
  - "0.0.0.0:5173:5173"
```

## 📊 Métricas de Optimización

### Tamaños de Imagen

- **Antes**: ~1.5GB
- **Desarrollo**: ~400-600MB
- **Producción**: ~200-300MB

### Dependencias Optimizadas

Las siguientes dependencias se excluyen en producción:
- `@types/*` - Tipos de TypeScript
- `@vitejs/*` - Herramientas de Vite
- `typescript` - Compilador TS
- `eslint*` - Linting tools
- `@testing-library/*` - Testing utilities

## 🔄 Comandos de Mantenimiento

### Actualizaciones

```bash
# Actualizar imagen base
docker pull node:20-alpine

# Reconstruir aplicación
docker-compose build app

# Reiniciar servicios
docker-compose restart app
```

### Backup

```bash
# Backup de volúmenes
docker run --rm -v consalud-app_node_modules:/data -v $(pwd):/backup alpine tar czf /backup/node_modules.tar.gz -C /data .

# Restaurar backup
docker run --rm -v consalud-app_node_modules:/data -v $(pwd):/backup alpine tar xzf /backup/node_modules.tar.gz -C /data
```

## 📞 Soporte

Para problemas o dudas:

1. Verificar logs: `docker-compose logs -f app`
2. Revisar health checks: `docker ps`
3. Consultar documentación de Docker
4. Contactar al equipo de desarrollo

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Inicio rápido desarrollo
docker-compose up -d app && docker-compose logs -f app

# Inicio rápido producción  
docker-compose --profile production up -d app-prod

# Parar todo
docker-compose down

# Reconstruir desde cero
docker-compose build --no-cache && docker-compose up app

# Ver estado y logs
docker-compose ps && docker-compose logs --tail=50 app
```