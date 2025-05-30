const fs = require('fs');
const path = require('path');

// Función para leer la configuración de optimización 
function loadOptimizationConfig() {
  try {
    // Como optimization.config.ts puede no estar compilado, usamos una versión simplificada
    const defaultConfig = {
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
      docker: {
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
      }
    };

    console.log('📋 Using default optimization config');
    return defaultConfig;
  } catch (error) {
    console.error('Error loading optimization config:', error);
    return null;
  }
}

// Función para verificar si una dependencia es de desarrollo
function isDevDependency(depName, patterns) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(depName);
    }
    return depName === pattern;
  });
}

// Función para optimizar package.json para producción
function optimizePackageJson() {
  const config = loadOptimizationConfig();
  if (!config) return;

  const packageJsonPath = path.join(__dirname, '../package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json no encontrado');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Filtrar dependencies de producción
  const prodDependencies = {};
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (!isDevDependency(dep, config.docker.excludeFromProduction)) {
        prodDependencies[dep] = packageJson.dependencies[dep];
      }
    });
  }

  // Crear versión optimizada para producción
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    dependencies: prodDependencies,
    scripts: {
      start: packageJson.scripts?.start || "serve -s dist",
      preview: packageJson.scripts?.preview
    }
  };

  // Guardar versión optimizada
  const prodPath = path.join(__dirname, '../package.prod.json');
  fs.writeFileSync(prodPath, JSON.stringify(prodPackageJson, null, 2));
  
  console.log('✅ package.prod.json creado exitosamente');
  console.log(`📦 Dependencies originales: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`📦 Dependencies optimizadas: ${Object.keys(prodDependencies).length}`);
  console.log(`📦 DevDependencies removidas: ${Object.keys(packageJson.devDependencies || {}).length}`);
  
  const removedDeps = Object.keys(packageJson.dependencies || {}).filter(dep => 
    isDevDependency(dep, config.docker.excludeFromProduction)
  );
  if (removedDeps.length > 0) {
    console.log(`🗑️  Dependencies removidas: ${removedDeps.join(', ')}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando optimización de dependencias...');
  optimizePackageJson();
}

module.exports = { optimizePackageJson, loadOptimizationConfig };
