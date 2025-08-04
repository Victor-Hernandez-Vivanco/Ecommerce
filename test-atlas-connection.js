import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  console.log('💡 Asegúrate de configurar .env.production.local con tu URI de Atlas');
  process.exit(1);
}

async function testAtlasConnection() {
  try {
    console.log('🧪 Probando conexión a MongoDB Atlas...');
    console.log('🔗 URI:', ATLAS_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const connection = await mongoose.connect(ATLAS_URI);
    console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');
    
    // Listar colecciones
    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📋 Colecciones disponibles:');
    if (collections.length === 0) {
      console.log('   (No hay colecciones aún)');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   📁 ${collection.name}: ${count} documentos`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Verifica tu usuario y contraseña de MongoDB Atlas');
    } else if (error.message.includes('network')) {
      console.log('💡 Verifica tu conexión a internet y la configuración de red de Atlas');
    }
  }
}

testAtlasConnection();