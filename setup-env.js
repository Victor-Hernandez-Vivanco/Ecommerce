import fs from 'fs';
import path from 'path';

// Configuración para desarrollo local
const localEnv = `# Configuración para desarrollo local
MONGODB_URI=mongodb://localhost:27017/frutos-secos-local
JWT_SECRET=tu-jwt-secret-local-muy-seguro-123
NEXTAUTH_SECRET=tu-nextauth-secret-local-muy-seguro-456
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
`;

// Configuración para producción (Atlas)
const productionEnv = `# Configuración para producción (Atlas)
MONGODB_URI=tu-mongodb-atlas-uri-aqui
JWT_SECRET=tu-jwt-secret-produccion-muy-seguro-789
NEXTAUTH_SECRET=tu-nextauth-secret-produccion-muy-seguro-012
NEXTAUTH_URL=https://tu-app.vercel.app
NODE_ENV=production
`;

try {
  // Crear .env.local para desarrollo
  fs.writeFileSync('.env.local', localEnv);
  console.log('✅ Archivo .env.local creado para desarrollo local');
  
  // Crear .env.production.local para referencias de Atlas
  fs.writeFileSync('.env.production.local', productionEnv);
  console.log('✅ Archivo .env.production.local creado (EDITA CON TUS DATOS REALES)');
  
  console.log('\n📝 IMPORTANTE:');
  console.log('1. Edita .env.production.local con tu URI real de MongoDB Atlas');
  console.log('2. Genera secretos seguros para producción');
  console.log('3. Nunca subas estos archivos a Git (ya están en .gitignore)');
  
} catch (error) {
  console.error('❌ Error creando archivos de entorno:', error);
}