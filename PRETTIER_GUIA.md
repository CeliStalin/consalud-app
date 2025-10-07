# 🎨 Guía de Prettier - Formateo de Código Consistente

## 🔧 Configuración

### **`.prettierrc.json`** - Reglas de Formato

```json
{
  "semi": true, //  Usar punto y coma
  "trailingComma": "es5", //  Coma final en objetos/arrays
  "singleQuote": true, //  Comillas simples en JavaScript/TypeScript
  "jsxSingleQuote": false, //  Comillas dobles en JSX (estándar React)
  "printWidth": 100, //  Máximo 100 caracteres por línea
  "tabWidth": 2, //  Indentación de 2 espacios
  "useTabs": false, //  Usar espacios, no tabs
  "arrowParens": "avoid", //  Omitir paréntesis en arrow functions con 1 param
  "bracketSpacing": true, // Espacios en objetos: { foo: bar }
  "endOfLine": "lf", //  Saltos de línea Unix (LF)
  "quoteProps": "as-needed" //  Solo comillas en propiedades cuando necesario
}
```

---

## 🚀 Comandos Disponibles

### **Formatear Todo el Proyecto**

```bash
npm run format
```

**Resultado**: Formatea todos los archivos `.ts`, `.tsx`, `.css`, `.json`, `.md` en `src/`

### **Solo Verificar (Sin Modificar)**

```bash
npm run format:check
```

**Resultado**: Lista archivos que NO cumplen con el formato (útil en CI/CD)

### **Formatear Archivo Específico**

```bash
npx prettier --write src/main.tsx
```

### **Formatear Solo Archivos Modificados (Git)**

```bash
npx prettier --write $(git diff --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$')
```

---

## 📋 **Ejemplo de Transformaciones**

### **1. Comillas Dobles → Simples**

**Antes**:

```typescript
import { useState } from 'react';
const name = 'Juan';
```

**Después**:

```typescript
import { useState } from 'react';
const name = 'Juan';
```

### **2. JSX Mantiene Comillas Dobles** (estándar React)

**Antes y Después** (sin cambio):

```tsx
<button className="btn-primary" onClick={handleClick}>
  Click me
</button>
```

### **3. Indentación Consistente**

**Antes**:

```typescript
function getData() {
  const result = {
    name: 'test',
    age: 25,
  };
  return result;
}
```

**Después**:

```typescript
function getData() {
  const result = {
    name: 'test',
    age: 25,
  };
  return result;
}
```

### **4. Comas Finales (Trailing Commas)**

**Antes**:

```typescript
const obj = {
  name: 'Juan',
  age: 25,
};
```

**Después**:

```typescript
const obj = {
  name: 'Juan',
  age: 25, // ← Coma agregada
};
```

### **5. Arrow Functions**

**Antes**:

```typescript
const filter = x => x > 0;
const multi = (a, b) => a * b;
```

**Después**:

```typescript
const filter = x => x > 0; // Sin paréntesis (1 parámetro)
const multi = (a, b) => a * b; // Con paréntesis (2+ parámetros)
```

---

## **Uso Recomendado**

### **Opción 1: Formatear Antes de Commit (Manual)**

```bash
# 1. Hacer cambios en el código
# 2. Antes de commit
npm run format

# 3. Verificar cambios
git diff

# 4. Commit
git add .
git commit -m "feat: nueva funcionalidad"
```

### **Opción 2: Pre-commit Automático con Husky** (Recomendado)

```bash
# Instalar Husky y lint-staged
npm install --save-dev husky lint-staged

# Inicializar Husky
npx husky init

# Crear .lintstagedrc.json
```

**`.lintstagedrc.json`**:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

**`.husky/pre-commit`**:

```bash
#!/bin/sh
npx lint-staged
```

**Resultado**: Cada vez que hagas `git commit`, el código se formatea automáticamente.

---

## ⚙️ **Integración con VS Code**

### **Instalar Extensión**

1. Abrir VS Code
2. Ir a Extensions (Ctrl+Shift+X)
3. Buscar "Prettier - Code formatter"
4. Instalar

### **Configurar `.vscode/settings.json`**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**Resultado**: Cada vez que guardes (Ctrl+S), el archivo se formatea automáticamente.

---

- ✅ Todas las comillas dobles `"` → simples `'` (excepto en JSX)
- ✅ Indentación inconsistente → 2 espacios
- ✅ Punto y coma faltantes → agregados
- ✅ Espacios inconsistentes → normalizados

---

## ⚠️ **Notas Importantes**

### **JSX usa Comillas Dobles** (Estándar React)

```tsx
// ✅ Correcto (Prettier mantiene comillas dobles en JSX)
<div className="container">
  <button onClick={handleClick}>Click</button>
</div>

// ❌ No se cambia a comillas simples en JSX
```

### **Strings en TypeScript/JavaScript usan Comillas Simples**

```typescript
// ✅ Después de Prettier
const name = 'Juan';
const path = '/api/users';
```

---

## 🎉 **Beneficios Inmediatos**

1. ✅ **Consistencia Total**: Todo el código usa el mismo formato
2. ✅ **Menos Conflictos en Azure**: Sin cambios de formato entre desarrolladores
3. ✅ **Code Reviews Más Rápidos**: Sin discusiones sobre estilo
4. ✅ **Productividad**: No pierdes tiempo formateando manualmente

---
