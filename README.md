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
   git clone https://devops.consalud.net/Consalud/PlantillaReact/_git/app-gestor-solicitudes
   cd app-gestor-solicitudes
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

> **Actualización importante:**
> Ahora puedes construir la imagen Docker para cualquier ambiente (desarrollo, producción, test) usando un único Dockerfile y los argumentos de build `ENV_FILE` y `MODE`. Ya no es necesario mantener Dockerfiles separados por ambiente.

Esta aplicación React con TypeScript está optimizada para ejecutarse en contenedores Docker con Alpine Linux.

## 🚢 Uso de Dockerfile Unificado

### 📝 ¿Cómo funciona el Dockerfile actual?

El Dockerfile principal ahora permite construir imágenes para **cualquier ambiente** (desarrollo, test, produccion) usando dos argumentos de build:

- `AMBIENTE`: El ambiente deseado (`desarrollo`, `test`, `produccion`). El Dockerfile selecciona automáticamente el archivo de entorno correcto:
  - `desarrollo` → `.env.development`
  - `test` → `.env.test`
  - `produccion` (o cualquier otro valor) → `.env.production`
- `MODE`: El modo de build de Vite (`development`, `test`, `production`).

**Por defecto:**  
Si no especificas los argumentos, se usará `produccion` y `production`.

---

### 🔨 Comandos de build recomendados

```sh
# Build para desarrollo
docker build --build-arg AMBIENTE=desarrollo --build-arg MODE=development -t app-gestor-solicitudes:dev .

# Build para test
docker build --build-arg AMBIENTE=test --build-arg MODE=test -t app-gestor-solicitudes:test .

# Build para producción (por defecto)
docker build --build-arg AMBIENTE=produccion --build-arg MODE=production -t app-gestor-solicitudes:prod .
```

---

### ⚙️ ¿Qué hace el Dockerfile?

1. **Selecciona el archivo de entorno** según el valor de `AMBIENTE` y lo copia como `.env` dentro de la imagen.
2. **Instala dependencias** usando `npm ci`.
3. **Ejecuta el build** de Vite usando el modo que elijas (`--mode $MODE`).
4. **Copia el resultado** al contenedor final de Nginx (solo archivos estáticos).
5. **Expone el puerto 80** (Nginx) para servir la app.

---

### 🚀 Ejecutar la imagen

```sh
# Ejemplo: correr la imagen de producción
docker run -p 8080:80 app-gestor-solicitudes:prod

# Ejemplo: correr la imagen de desarrollo (build con modo development)
docker run -p 5173:80 app-gestor-solicitudes:dev
```

> **Nota:** El puerto de la izquierda (`8080`, `5173`, etc.) puede ser **cualquier puerto disponible** en tu máquina local. Si el puerto está ocupado, puedes cambiarlo por otro que esté libre, por ejemplo `-p 3000:80` o `-p 9000:80`.

---

### ⚠️ Notas importantes

- El build de Vite **inyecta las variables de entorno en tiempo de build**. Si cambias el archivo `.env`, debes reconstruir la imagen.
- El contenedor final **solo sirve archivos estáticos** (no ejecuta Node.js en producción).
- Puedes crear tantos archivos `.env.*` como ambientes necesites y usarlos con el argumento `AMBIENTE`.
- El puerto expuesto por defecto es el 80 (Nginx). Puedes mapearlo al que quieras en tu máquina con `-p`.

- Regenerar el lockfile compatible con Docker/Linux

**¿Cuándo ejecutar este paso?**
- Solo cuando se agrege, elimine o actualice dependencias en `package.json`.
- No es necesario si solo cambias código fuente.
- Se hace **antes de construir la imagen Docker** para evitar errores de instalación.

**¿Qué comando usar?**

- **En PowerShell o CMD (Windows):**
  ```sh
  npm run lockfile:linux-win
  ```
- **En Bash/WSL/Linux:**
  ```sh
  npm run lockfile:linux-bash
  ```

Esto generará un `package-lock.json` compatible con Linux (el entorno de Docker).

---

Una vez que el lockfile está actualizado, se construye la imagen dev normalmente:

```sh
docker build --no-cache -f Dockerfile.dev -t app-gestor-solicitudes:dev .
```

Esto creará la imagen lista para desarrollo en Docker.

---


## 4. Notas
- Si solo cambias código fuente, puedes construir la imagen directamente sin regenerar el lockfile.
- Si el build falla por el lockfile, repite el paso 1 antes de volver a intentar el build.

## 🛡️ Vulnerabilidades conocidas

No existen vulnerabilidades críticas ni de alto riesgo en producción. Se recomienda revisar periódicamente el reporte de `npm audit` y actualizar dependencias cuando sea seguro hacerlo.

## 🌐 Configuración de nginx.conf para dominios personalizados

Cuando se despliegue la aplicación en un servidor real con un dominio (por ejemplo, www.app.des,www.app.tes), se debe ajustar la directiva `server_name` en el archivo `nginx.conf`.

### Ejemplo para un dominio específico:

```nginx
server {
  listen 80;
  server_name www.miapp.des;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    try_files $uri =404;
    expires 1y;
    access_log off;
    add_header Cache-Control "public";
  }
}
```

### Para aceptar varios dominios o subdominios:

```nginx
server_name www.miapp.des miapp.des;
```

### Para aceptar cualquier dominio :

```nginx
server_name _;
```

> **Recordar:**
> - se cambia el valor de `server_name` según el dominio real de la aplicación.
> - Si usas HTTPS, deberás agregar configuración SSL adicional.
> - Después de modificar `nginx.conf`, reconstruye la imagen Docker o reemplaza el archivo en el servidor según corresponda.

### Ejemplo para HTTPS (con certificado SSL):

```nginx
server {
  listen 443 ssl;
  server_name www.miapp.des;

  ssl_certificate     /etc/nginx/ssl/miapp.crt;
  ssl_certificate_key /etc/nginx/ssl/miapp.key;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    try_files $uri =404;
    expires 1y;
    access_log off;
    add_header Cache-Control "public";
  }
}
```

> **Importante:**
> - Cambia las rutas de los certificados (`ssl_certificate` y `ssl_certificate_key`) por las del servidor.
> - Si quieres redirigir todo el tráfico HTTP a HTTPS, se puede agregar un bloque adicional:
>
> ```nginx
> server {
>   listen 80;
>   server_name www.miapp.des;
>   return 301 https://$host$request_uri;
> }
> ```
