# Mejora: Carga Dinámica de Documentos

## Resumen de Cambios

Se implementó una mejora significativa en la página `/mnherederos/ingresoher/cargadoc` para que la carga de documentos sea dinámica basada en los tipos de documentos disponibles en el sistema.

## Nuevas Funcionalidades

### 1. Endpoint Dinámico
- **Endpoint**: `/api/Pargen/TipoDocumento`
- **Respuesta**: Lista de tipos de documentos disponibles
- **Estructura**:
```json
[
  {
    "valValor": 1,
    "descripcion": "Cédula de Identidad"
  },
  {
    "valValor": 2,
    "descripcion": "Poder Notarial"
  },
  {
    "valValor": 3,
    "descripcion": "Posesión Efectiva"
  }
]
```

### 2. Componente Reutilizable
Se creó el componente `DocumentUploadArea` que encapsula toda la lógica de carga de archivos:
- Validación de archivos (tipo y tamaño)
- Interfaz de usuario consistente
- Manejo de errores
- Estados de carga

### 3. Hook Personalizado
Se implementó `useTiposDocumento` para manejar:
- Carga de tipos de documentos desde el API
- Estados de loading y error
- Reintento en caso de fallo

## Archivos Modificados/Creados

### Nuevos Archivos
1. **`src/features/herederos/components/DocumentUploadArea.tsx`**
   - Componente reutilizable para carga de documentos
   - Validación de archivos integrada
   - Interfaz de usuario consistente

2. **`src/features/herederos/hooks/useTiposDocumento.ts`**
   - Hook personalizado para manejar tipos de documentos
   - Estados de loading y error
   - Función de refetch

### Archivos Modificados
1. **`src/features/herederos/interfaces/Pargen.ts`**
   - Agregada interfaz `TipoDocumento`

2. **`src/features/herederos/services/herederosService.ts`**
   - Agregado método `getTiposDocumento()`
   - Agregada función `fetchTiposDocumento()`

3. **`src/features/herederos/components/CargaDocumento.tsx`**
   - Refactorizado para usar tipos dinámicos
   - Eliminada lógica hardcodeada
   - Implementado renderizado dinámico

4. **`src/features/herederos/services/index.ts`**
   - Agregada exportación de `TipoDocumento`

## Beneficios de la Implementación

### 1. Escalabilidad
- El frontend se adapta automáticamente a nuevos tipos de documentos
- No requiere cambios en el código cuando se agregan nuevos tipos
- Mantenimiento simplificado

### 2. Reutilización
- Componente `DocumentUploadArea` puede usarse en otras partes de la aplicación
- Lógica de validación centralizada
- Consistencia en la interfaz de usuario

### 3. Robustez
- Manejo de errores mejorado
- Estados de loading apropiados
- Validación de archivos robusta

### 4. Mantenibilidad
- Código más limpio y organizado
- Separación de responsabilidades
- Hooks personalizados para lógica reutilizable

## Cómo Funciona

1. **Carga Inicial**: Al cargar la página, se hace una llamada al endpoint `/api/Pargen/TipoDocumento`
2. **Renderizado Dinámico**: Se renderiza un `DocumentUploadArea` por cada tipo de documento
3. **Validación**: Cada área de carga valida archivos individualmente
4. **Envío**: Solo se permite continuar cuando todos los documentos están cargados

## Compatibilidad

- ✅ Mantiene toda la funcionalidad existente
- ✅ Compatible con el flujo actual de navegación
- ✅ No rompe la funcionalidad de ejemplos
- ✅ Mantiene el diseño y UX existente

## Pruebas

Para probar la implementación:

1. Navegar a `/mnherederos/ingresoher/cargadoc`
2. Verificar que se cargan los tipos de documentos dinámicamente
3. Probar la carga de archivos para cada tipo
4. Verificar que la validación funciona correctamente
5. Comprobar que el botón "Continuar" se habilita solo cuando todos los documentos están cargados

## Futuras Mejoras

1. **Cache**: Implementar cache para los tipos de documentos
2. **Validación Avanzada**: Agregar validación específica por tipo de documento
3. **Preview**: Agregar preview de documentos cargados
4. **Drag & Drop**: Implementar drag and drop para mejor UX 