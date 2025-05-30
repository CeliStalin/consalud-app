// Configuración para optimización de la aplicación

export const appConfig = {
  // Dependencias que deben ser peer dependencies
  peerDependencies: [
    '@azure/msal-browser',
    'bulma', 
    'react',
    'react-dom',
    'react-router-dom'
  ],
  
  // Dependencias que pueden ser incluidas en el bundle
  bundledDependencies: [
    'axios',
    'sweetalert2',
    'date-fns',
    'react-datepicker',
    'xml2js',
    'xmldom'
  ],
  
  // Dependencias de desarrollo que no deben ir a producción
  devOnlyDependencies: [
    '@types/*',
    '@vitejs/*',
    'typescript',
    'vite',
    'eslint*',
    '@testing-library/*',
    'jest*',
    'vitest*'
  ],
  
  // Configuración específica para Docker
  docker: {
    // Archivos a excluir del contexto de build
    excludeFromContext: [
      'node_modules',
      '.git',
      '*.md',
      '.env*',
      'coverage',
      'docs',
      'tests',
      '*.log',
      '.vscode',
      '.idea',
      'dist',
      'build'
    ],
    
    // Dependencias que NO deben estar en producción
    excludeFromProduction: [
      '@types/*',
      '@vitejs/*',
      'typescript',
      'vite',
      'eslint*',
      '@testing-library/*',
      'jest*',
      'vitest*'
    ]
  },

  // Configuración de tree-shaking
  treeShaking: {
    sideEffects: false,
    purgeableExports: [
      'test/*',
      '*.test.*',
      '*.spec.*'
    ]
  }
};

// Función helper para verificar si una dependencia es de desarrollo
export const isDevDependency = (depName: string): boolean => {
  return appConfig.devOnlyDependencies.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(depName);
    }
    return depName === pattern;
  });
};

// Función helper para generar lista de exclusiones para Docker
export const getDockerExclusions = (): string[] => {
  return appConfig.docker.excludeFromContext;
};

// Función para obtener dependencias de producción
export const getProductionDeps = (allDeps: string[]): string[] => {
  return allDeps.filter(dep => !isDevDependency(dep));
};
