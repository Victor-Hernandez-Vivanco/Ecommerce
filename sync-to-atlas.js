import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.production.local' });

const LOCAL_URI = "mongodb://localhost:27017/planzzz";
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  process.exit(1);
}

const COLLECTIONS_TO_SYNC = [
  "products",
  "categories", 
  "users",
  "advertisements"
];

async function syncToAtlas() {
  console.log("🔄 Iniciando sincronización Local → Atlas...");
  console.log("📍 Origen: MongoDB Local (planzzz)");
  console.log("🌐 Destino: MongoDB Atlas (frutos-secos)");
  
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);
  
  try {
    // Conectar a ambas bases
    console.log("\n🔗 Conectando a bases de datos...");
    await localClient.connect();
    console.log("✅ Conectado a MongoDB Local");
    
    await atlasClient.connect();
    console.log("✅ Conectado a MongoDB Atlas");
    
    const localDb = localClient.db();
    const atlasDb = atlasClient.db();
    
    let totalDocuments = 0;
    
    // Sincronizar cada colección
    for (const collectionName of COLLECTIONS_TO_SYNC) {
      console.log(`\n📦 Sincronizando colección: ${collectionName}`);
      
      try {
        // Obtener datos de local
        const localData = await localDb.collection(collectionName).find({}).toArray();
        console.log(`📊 Documentos en local: ${localData.length}`);
        
        if (localData.length > 0) {
          // Limpiar Atlas y copiar datos
          const deleteResult = await atlasDb.collection(collectionName).deleteMany({});
          console.log(`🗑️ Atlas limpiado (${deleteResult.deletedCount} docs eliminados)`);
          
          const insertResult = await atlasDb.collection(collectionName).insertMany(localData);
          console.log(`✅ ${insertResult.insertedCount} documentos copiados a Atlas`);
          totalDocuments += insertResult.insertedCount;
        } else {
          console.log(`ℹ️ No hay datos para copiar en ${collectionName}`);
          // Limpiar colección vacía en Atlas también
          await atlasDb.collection(collectionName).deleteMany({});
        }
      } catch (error) {
        console.error(`❌ Error sincronizando ${collectionName}:`, error.message);
      }
    }
    
    // Verificación final
    console.log("\n🔍 Verificación final:");
    console.log("─".repeat(40));
    for (const collectionName of COLLECTIONS_TO_SYNC) {
      try {
        const atlasCount = await atlasDb.collection(collectionName).countDocuments();
        const localCount = await localDb.collection(collectionName).countDocuments();
        const status = localCount === atlasCount ? "✅" : "⚠️";
        console.log(`${status} ${collectionName}: ${atlasCount} docs (local: ${localCount})`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Error verificando`);
      }
    }
    console.log("─".repeat(40));
    
    console.log(`\n🎉 ¡Sincronización completada exitosamente!`);
    console.log(`📊 Total documentos sincronizados: ${totalDocuments}`);
    console.log(`🚀 Tu app en Vercel ahora tendrá los datos actualizados`);
    console.log(`🌐 URL: https://ecommerce-2ni7hzrd6-victorhernandezvivanco75-6138s-projects.vercel.app`);
    
  } catch (error) {
    console.error("❌ Error durante la sincronización:", error);
    console.log("\n💡 Posibles soluciones:");
    console.log("   • Verifica que MongoDB local esté ejecutándose");
    console.log("   • Verifica la conexión a internet para Atlas");
    console.log("   • Verifica las credenciales de Atlas");
  } finally {
    try {
      await localClient.close();
      await atlasClient.close();
      console.log("\n🔌 Conexiones cerradas");
    } catch (error) {
      // Ignorar errores de cierre
    }
  }
}

// Ejecutar sincronización
syncToAtlas().catch(console.error);