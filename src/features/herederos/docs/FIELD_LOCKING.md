# Sistema de Bloqueo de Campos

## Descripción

Este sistema implementa el bloqueo automático de campos específicos cuando la API `/api/Solicitante/mejorContactibilidad` devuelve un status 200 exitoso.

## Campos Bloqueados

Los siguientes campos se bloquean automáticamente cuando se obtienen datos del sistema:

- **Fecha de nacimiento** (`fechaNacimiento`)
- **Nombres** (`nombres`)
- **Apellido paterno** (`apellidoPaterno`)
- **Apellido materno** (`apellidoMaterno`)

## Implementación

### 1. HerederoProvider

El `HerederoProvider` maneja el estado de bloqueo:

```typescript
const [fieldsLocked, setFieldsLocked] = useState<boolean>(false);

// Se activa cuando la API devuelve 200
setFieldsLocked(true);
```

### 2. FormIngresoHeredero

El componente del formulario aplica el bloqueo:

```typescript
const { heredero, fieldsLocked } = useHeredero();

// Los campos se deshabilitan cuando fieldsLocked es true
disabled={fieldsLocked}
```

### 3. Validación

La validación considera los campos bloqueados:

```typescript
// Solo validar campos bloqueados si no están bloqueados
if (!fieldsLocked) {
  // Validar fechaNacimiento, nombres, apellidos
}
```

## Características

### Indicadores Visuales

- **Mensaje informativo**: Se muestra cuando los campos están bloqueados
- **Estilos de Bulma**: Se aplican clases `is-static` y estilos de deshabilitado
- **Iconos**: Se muestran iconos de candado en los labels

### Experiencia de Usuario

- **Feedback claro**: El usuario sabe qué campos están bloqueados y por qué
- **Consistencia visual**: Los campos bloqueados tienen un estilo distintivo
- **Accesibilidad**: Se mantienen las propiedades ARIA apropiadas

## Mejores Prácticas Aplicadas

### TypeScript

- **Tipos estrictos**: Se definen interfaces para todos los estados
- **Constantes tipadas**: Se usan `as const` para las constantes
- **Generics**: Se utilizan genéricos para reutilización de código

### React

- **Hooks personalizados**: Se crearon hooks específicos para la funcionalidad
- **Context API**: Se usa el contexto para compartir el estado
- **Componentes reutilizables**: Se crearon componentes específicos

### Bulma CSS

- **Clases nativas**: Se usan las clases de Bulma para estados deshabilitados
- **Consistencia**: Se mantiene la consistencia con el diseño del sistema
- **Responsive**: Se mantiene la responsividad

## Archivos Modificados

1. `HerederoProvider.tsx` - Agregado estado de bloqueo
2. `HerederoContext.ts` - Agregado campo fieldsLocked
3. `FormIngresoHeredero.tsx` - Aplicado bloqueo a campos específicos
4. `LockedFieldIndicator.tsx` - Componente para indicadores visuales
5. `useFieldLocking.ts` - Hook para manejo de estado
6. `useLockedFieldValidation.ts` - Hook para validación
7. `fieldLocking.ts` - Tipos y constantes

## Uso

El sistema se activa automáticamente cuando:

1. Se busca un heredero por RUT
2. La API `/api/Solicitante/mejorContactibilidad` devuelve 200
3. Se cargan los datos del heredero en el formulario

Los campos se bloquean automáticamente y el usuario recibe feedback visual claro sobre el estado. 