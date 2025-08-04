import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

// CORREGIDO: Usar el nombre correcto de la base local
const LOCAL_URI = 'mongodb://localhost:27017/planzzz';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  process.exit(1);
}

async function verifySync() {
  try {
    console.log('🔍 Verificando sincronización Local ↔ Atlas...');
    
    // Conectar a ambas bases
    const localConn = await mongoose.createConnection(LOCAL_URI);
    const atlasConn = await mongoose.createConnection(ATLAS_URI);
    
    // CORREGIDO: Usar nombres correctos de las bases de datos
    const localDb = localConn.getClient().db('planzzz');
    const atlasDb = atlasConn.getClient().db('frutos-secos');
    
    const collections = ['products', 'categories', 'users', 'advertisements'];
    
    console.log('\n📊 Comparación de documentos:');
    console.log('─'.repeat(50));
    
    let allMatch = true;
    
    for (const collection of collections) {
      const localCount = await localDb.collection(collection).countDocuments();
      const atlasCount = await atlasDb.collection(collection).countDocuments();
      
      const status = localCount === atlasCount ? '✅' : '❌';
      if (localCount !== atlasCount) allMatch = false;
      
      console.log(`${status} ${collection.padEnd(15)} | Local: ${localCount.toString().padStart(3)} | Atlas: ${atlasCount.toString().padStart(3)}`);
    }
    
    console.log('─'.repeat(50));
    
    if (allMatch) {
      console.log('🎉 ¡Perfecto! Todos los datos están sincronizados');
      console.log('✅ Listo para deploy a producción');
    } else {
      console.log('⚠️ Hay diferencias en los datos');
      console.log('🔄 Considera ejecutar sync-to-atlas.js nuevamente');
    }
    
    await localConn.close();
    await atlasConn.close();
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Asegúrate de que MongoDB local esté ejecutándose');
    }
  }
}

verifySync();