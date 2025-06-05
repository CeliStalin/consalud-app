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
   git clone https://devops.consalud.net/Consalud/PlantillaReact/_git/app-solicitudes
   cd app-solicitudes
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

## ⚡ ORDEN DE EJECUCIÓN (MUY IMPORTANTE)

### 🔄 ¿Qué sucede cuando ejecutas `docker-compose up app`?

```
1. TÚ EJECUTAS: docker-compose up app
   ↓
2. Docker Compose LEE: docker-compose.yml
   ↓
3. Docker Compose EJECUTA: Dockerfile (target: development)
   ↓
4. Dockerfile EJECUTA AUTOMÁTICAMENTE (en este orden):
   ├── Etapa 1: optimizer (ejecuta optimize-deps.js)
   ├── Etapa 2: deps-dev (instala dependencias de desarrollo)
   ├── Etapa 3: deps-prod (instala dependencias de producción)
   └── Etapa 4: development (crea imagen final)
   ↓
5. Docker CREA el contenedor
   ↓
6. Docker EJECUTA: npm run dev --host 0.0.0.0
   ↓
7. ✅ TU APP FUNCIONA en http://localhost:5173
```

### 📁 ¿Qué archivo ejecuta qué?

| Archivo | Ejecutado por | Cuándo | Propósito |
|---------|---------------|--------|-----------|
| `docker-compose.yml` | **TÚ** (manual) | `docker-compose up app` | Orquesta todo el proceso |
| `Dockerfile` | **Docker Compose** (automático) | Durante `docker-compose up` | Construye la imagen |
| `optimize-deps.js` | **Dockerfile** (automático) | Durante construcción de imagen | Optimiza dependencias |
| `package.json` | **Dockerfile** (automático) | Durante `npm ci` y `npm run dev` | Define dependencias y scripts |

## 🚀 Instalación y Ejecución

### ✅ Comando Principal

```bash
# Navegar a tu directorio
cd c:\app-solicitudes

# EJECUTAR TODO AUTOMÁTICAMENTE
docker-compose up app

# Esto hace AUTOMÁTICAMENTE:
# ✅ Lee docker-compose.yml
# ✅ Ejecuta Dockerfile
# ✅ Ejecuta optimize-deps.js
# ✅ Instala dependencias
# ✅ Ejecuta npm run dev
# ✅ Tu app funciona en http://localhost:5173
```

### 🔧 Otros Comandos Útiles

```bash
# En background (no bloquea la terminal)
docker-compose up -d app

# Ver logs en tiempo real
docker-compose logs -f app

# Parar la aplicación
docker-compose down

# Reconstruir desde cero (si cambias dependencias)
docker-compose build --no-cache app
docker-compose up app
```

### 🎯 Para Producción

```bash
# Versión optimizada para producción
docker-compose --profile production up app-prod

# Acceso: http://localhost:3000
```

## 📊 Secuencia Detallada de Ejecución

### Paso a Paso - ¿Qué sucede internamente?

```bash
# 1. Ejecutas este comando:
docker-compose up app

# 2. Docker Compose busca:
#    ✅ docker-compose.yml (encontrado)
#    ✅ Dockerfile (encontrado)

# 3. Docker ejecuta Dockerfile con target=development:
#    📦 Etapa 'base': Prepara Node.js 20 Alpine
#    🔧 Etapa 'optimizer': Ejecuta node scripts/optimize-deps.js
#    📚 Etapa 'deps-dev': Ejecuta npm ci (todas las dependencias)
#    📚 Etapa 'deps-prod': Ejecuta npm ci --only=production
#    🏗️ Etapa 'development': Copia código y configura usuario

# 4. Docker crea el contenedor:
#    🌐 Puerto 5173:5173
#    📁 Volúmenes sincronizados
#    🔧 Variables de entorno configuradas

# 5. Docker ejecuta el comando final:
#    npm run dev --host 0.0.0.0

# 6. ✅ Aplicación disponible en http://localhost:5173
```

## 🛠️ Troubleshooting del Orden de Ejecución

### ❌ Error: "No such file optimize-deps.js"
```bash
# Verificar que tienes el archivo:
ls scripts/optimize-deps.js

# Si no existe, recrear:
mkdir -p scripts
# (copiar el contenido del optimize-deps.js desde la documentación)
```

### ❌ Error: "Cannot read docker-compose.yml"
```bash
# Verificar que estás en el directorio correcto:
pwd
ls docker-compose.yml

# Debe mostrar el archivo docker-compose.yml
```

### ❌ Error: "Port 5173 already in use"
```bash
# Ver qué está usando el puerto:
sudo lsof -i :5173

# Parar contenedores previos:
docker-compose down
```

## 🎯 Comandos de Referencia Rápida

```bash
# DESARROLLO (lo que más usarás)
docker-compose up app                    # Ejecuta todo automáticamente
docker-compose up -d app                 # En background
docker-compose logs -f app               # Ver logs
docker-compose down                      # Parar todo

# PRODUCCIÓN
docker-compose --profile production up app-prod

# MANTENIMIENTO
docker-compose build --no-cache app      # Reconstruir imagen
docker-compose ps                        # Ver estado
docker system prune -a                   # Limpiar Docker
```

## 📞 Soporte

**Si algo no funciona, verificar en este orden:**

1. ✅ **Docker instalado**: `docker --version`
2. ✅ **Docker Compose instalado**: `docker-compose --version`
3. ✅ **Archivos presentes**: `ls docker-compose.yml Dockerfile`
4. ✅ **Script presente**: `ls scripts/optimize-deps.js`
5. ✅ **Directorio correcto**: `pwd` debe mostrar `.../app-solicitudes`

**Comando de diagnóstico completo:**
```

## Docker: Uso por ambiente

Ahora el proyecto usa Dockerfiles separados por ambiente para optimizar el tamaño y la claridad:

- `Dockerfile.base`: etapas comunes (no se usa directamente)
- `Dockerfile.dev`: ambiente de desarrollo
- `Dockerfile.prod`: ambiente de producción
- `Dockerfile.test`: ambiente de testing

### Desarrollo

```sh
docker-compose up app
```
Esto levanta la app en modo desarrollo en http://localhost:5173

### Producción

```sh
docker-compose --profile production up app-prod
```
Esto construye y levanta la app optimizada en http://localhost:3000

### Testing

```sh
docker-compose --profile test up app-test
```
Esto construye y ejecuta los tests.

### Build manual (opcional)

Puedes construir manualmente cada imagen:

```sh
docker build -f Dockerfile.dev -t consalud-app-dev .
docker build -f Dockerfile.prod -t consalud-app-prod .
docker build -f Dockerfile.test -t consalud-app-test .
```

---

**Nota:** Si solo quieres servir estáticos en producción, consulta la sección de optimización avanzada para usar Nginx.

# 🚢 Ejecución de la aplicación con Docker por ambiente

Este proyecto utiliza **Dockerfiles separados** para cada ambiente, lo que permite imágenes más pequeñas y procesos más claros. A continuación se explica cómo levantar cada ambiente:

## 1. Desarrollo (hot reload, código editable)

- **Comando:**
  ```sh
  docker-compose up app
  ```
- **URL:** [http://localhost:5173](http://localhost:5173)
- **Descripción:**
  - Levanta la app en modo desarrollo con hot reload.
  - Sincroniza el código fuente de tu máquina con el contenedor (volúmenes).
  - Ideal para desarrollo diario.

## 2. Producción (build optimizado, solo archivos estáticos)

- **Comando:**
  ```sh
  docker-compose --profile production up app-prod
  ```
- **URL:** [http://localhost:3000](http://localhost:3000)
- **Descripción:**
  - Construye la imagen usando `Dockerfile.prod` (multi-stage: Node para build, Nginx para servir).
  - Sirve solo los archivos estáticos generados por Vite.
  - Ideal para pruebas de despliegue y producción real.
  - **Asegúrate de que el puerto 3000 esté libre en tu máquina.**

## 3. Testing (ejecución de tests, sin URL)

- **Comando:**
  ```sh
  docker-compose --profile test up app-test
  ```
- **Descripción:**
  - Construye la imagen usando `Dockerfile.test`.
  - Ejecuta los tests y muestra el resultado en consola/logs.
  - El contenedor se apaga automáticamente al terminar los tests.
  - **No expone ningún puerto ni URL.**

## 4. Build manual de imágenes (opcional)

Construir las imágenes manualmente:

```sh
# Desarrollo
docker build -f Dockerfile.dev -t consalud-app-dev .

# Producción
docker build -f Dockerfile.prod -t consalud-app-prod .

# Testing
docker build -f Dockerfile.test -t consalud-app-test .
```

Luego se puede correr los contenedores manualmente con `docker run` y mapear los puertos según corresponda.

---

### ⚠️ Notas importantes
- **Desarrollo:** El código fuente se sincroniza en caliente, ideal para programar.
- **Producción:** No expone Node ni dependencias de desarrollo.
- **Testing:** Solo ejecuta tests, no expone la app por web.
- **Puertos:**
  - Desarrollo: 5173
  - Producción: 3000 (puedes cambiarlo en `docker-compose.yml`)
  - Testing: no expone puerto
