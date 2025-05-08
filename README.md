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
- `/MnHerederos/ingresoHer` - Ingreso de herederos
- `/MnHerederos/ingresoDoc` - Ingreso de documentación

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