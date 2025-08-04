import fs from 'fs';
import path from 'path';

function setupEnvironment() {
  console.log("⚙️ Configurando entorno para desarrollo local...");
  
  // Configuración para desarrollo local
  const localEnv = `# CONFIGURACIÓN PARA DESARROLLO LOCAL
MONGODB_URI=mongodb://localhost:27017/planzzz
JWT_SECRET=2b08a61e562b7fa4daa0ebfe1e69e89d0c3b0d979d95d21ba405bc5ceeccf5e4
NEXTAUTH_SECRET=f613510c9b426bd60e5d3fae7b44fdf1b96a0de5ee8efe3927004fb4cbdab9c9
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development`;
  
  // Configuración para producción (Atlas)
  const prodEnv = `# CONFIGURACIÓN PARA PRODUCCIÓN (ATLAS)
MONGODB_URI=mongodb+srv://admin-frutos:858QAyMqyFGLqg8J@frutos-secos-cluster.tvwpbfk.mongodb.net/frutos-secos?retryWrites=true&w=majority&appName=frutos-secos-cluster
JWT_SECRET=2b08a61e562b7fa4daa0ebfe1e69e89d0c3b0d979d95d21ba405bc5ceeccf5e4
NEXTAUTH_SECRET=f613510c9b426bd60e5d3fae7b44fdf1b96a0de5ee8efe3927004fb4cbdab9c9
NEXTAUTH_URL=https://ecommerce-2ni7hzrd6-victorhernandezvivanco75-6138s-projects.vercel.app
NODE_ENV=production`;
  
  try {
    // Escribir .env.local (desarrollo)
    fs.writeFileSync('.env.local', localEnv);
    console.log("✅ .env.local configurado para desarrollo local");
    
    // Escribir .env.production.local (producción)
    fs.writeFileSync('.env.production.local', prodEnv);
    console.log("✅ .env.production.local configurado para Atlas");
    
    console.log("\n🎯 Configuración completada:");
    console.log("🏠 Desarrollo: npm run dev (usa MongoDB local)");
    console.log("🌐 Producción: Vercel deploy (usa Atlas)");
    console.log("🔄 Sincronización: node sync-to-atlas.js");
    
  } catch (error) {
    console.error("❌ Error configurando entorno:", error);
  }
}

// Ejecutar configuración
setupEnvironment();