import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production.local' });

const uri = process.env.MONGODB_URI;

async function testAtlasConnection() {
  console.log('🔗 Probando conexión a Atlas...');
  console.log('👤 Usuario: admin-frutos');
  console.log('🌐 Cluster: frutos-secos-cluster');
  
  try {
    const client = new MongoClient(uri);
    console.log('⏳ Conectando...');
    
    await client.connect();
    console.log('✅ ¡Conexión exitosa a Atlas!');
    
    const db = client.db('frutos-secos');
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Colecciones encontradas:');
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });
    
    // Probar una operación simple
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Usuarios en Atlas: ${userCount}`);
    
    await client.close();
    console.log('\n🎉 ¡Todo funciona correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 La contraseña es incorrecta.');
      console.log('💡 Solución: Resetea la contraseña en Atlas.');
    }
  }
}

testAtlasConnection();