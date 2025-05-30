import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para leer la configuración de optimización 
function loadOptimizationConfig() {
  try {
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

// Función para generar package-lock.json de producción
function generateProductionLockfile(prodPackageJsonPath) {
  try {
    console.log('🔄 Generando package-lock.json para producción...');
    
    const originalDir = process.cwd();
    const tempDir = join(__dirname, '../temp-prod');
    
    // Crear directorio temporal
    execSync(`mkdir -p ${tempDir}`, { stdio: 'inherit' });
    
    // Copiar package.prod.json como package.json al directorio temporal
    copyFileSync(prodPackageJsonPath, join(tempDir, 'package.json'));
    
    // Copiar el archivo .tgz si existe
    const tgzPath = join(__dirname, '../consalud-core-1.0.0.tgz');
    if (existsSync(tgzPath)) {
      copyFileSync(tgzPath, join(tempDir, 'consalud-core-1.0.0.tgz'));
    }
    
    // Cambiar al directorio temporal y ejecutar npm install
    process.chdir(tempDir);
    execSync('npm install --package-lock-only --no-audit --no-fund', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Copiar el package-lock.json generado de vuelta
    const generatedLockfile = join(tempDir, 'package-lock.json');
    const targetLockfile = join(__dirname, '../package-lock.prod.json');
    
    if (existsSync(generatedLockfile)) {
      copyFileSync(generatedLockfile, targetLockfile);
      console.log('✅ package-lock.prod.json generado exitosamente');
    }
    
    // Limpiar directorio temporal
    process.chdir(originalDir);
    execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('❌ Error generando lockfile de producción:', error.message);
    return false;
  }
}

// Función para optimizar package.json para producción
function optimizePackageJson() {
  const config = loadOptimizationConfig();
  if (!config) return false;

  const packageJsonPath = join(__dirname, '../package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.error('❌ package.json no encontrado');
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

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
      start: packageJson.scripts?.start || "vite preview --port 3000 --host 0.0.0.0",
      preview: packageJson.scripts?.preview
    }
  };

  // Guardar versión optimizada
  const prodPath = join(__dirname, '../package.prod.json');
  writeFileSync(prodPath, JSON.stringify(prodPackageJson, null, 2));
  
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

  // Generar package-lock.json de producción
  const lockfileGenerated = generateProductionLockfile(prodPath);
  
  return lockfileGenerated;
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando optimización de dependencias...');
  const success = optimizePackageJson();
  
  if (success) {
    console.log('🎉 Optimización completada exitosamente');
  } else {
    console.error('❌ Error en la optimización');
    process.exit(1);
  }
}

// Exportar funciones (ES modules style)
export { optimizePackageJson, loadOptimizationConfig };
