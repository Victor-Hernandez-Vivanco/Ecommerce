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

const COLLECTIONS = ["products", "categories", "users", "advertisements"];

async function verifySync() {
  console.log("🔍 Verificando sincronización Local ↔ Atlas...");
  
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);
  
  try {
    console.log("\n🔗 Conectando a ambas bases...");
    await localClient.connect();
    console.log("✅ Conectado a Local");
    
    await atlasClient.connect();
    console.log("✅ Conectado a Atlas");
    
    const localDb = localClient.db();
    const atlasDb = atlasClient.db();
    
    console.log("\n📊 Comparación detallada:");
    console.log("═".repeat(60));
    console.log("Colección\t\tLocal\tAtlas\tEstado\t\tDiferencia");
    console.log("═".repeat(60));
    
    let allSynced = true;
    let totalLocal = 0;
    let totalAtlas = 0;
    
    for (const collection of COLLECTIONS) {
      try {
        const localCount = await localDb.collection(collection).countDocuments();
        const atlasCount = await atlasDb.collection(collection).countDocuments();
        
        totalLocal += localCount;
        totalAtlas += atlasCount;
        
        const synced = localCount === atlasCount;
        const status = synced ? "✅ SYNC" : "⚠️ DIFF";
        const diff = synced ? "-" : `${Math.abs(localCount - atlasCount)}`;
        
        if (!synced) allSynced = false;
        
        console.log(`${collection.padEnd(16)}\t${localCount}\t${atlasCount}\t${status}\t\t${diff}`);
        
        // Mostrar detalles si hay diferencias
        if (!synced && (localCount > 0 || atlasCount > 0)) {
          if (localCount > 0 && atlasCount === 0) {
            console.log(`   └─ ⚠️ Atlas vacío, local tiene datos`);
          } else if (localCount === 0 && atlasCount > 0) {
            console.log(`   └─ ⚠️ Local vacío, Atlas tiene datos`);
          } else {
            console.log(`   └─ ⚠️ Cantidades diferentes`);
          }
        }
        
      } catch (error) {
        console.log(`${collection.padEnd(16)}\t❌\t❌\t❌ ERROR\t\t-`);
        allSynced = false;
      }
    }
    
    console.log("═".repeat(60));
    console.log(`TOTAL\t\t\t${totalLocal}\t${totalAtlas}\t${allSynced ? '✅ OK' : '⚠️ DIFF'}\t\t${Math.abs(totalLocal - totalAtlas)}`);
    console.log("═".repeat(60));
    
    // Resultado final
    if (allSynced) {
      console.log("\n🎉 ¡Perfecto! Todas las colecciones están sincronizadas");
      console.log("🚀 Tu app en Vercel tendrá los mismos datos que local");
    } else {
      console.log("\n⚠️ Hay diferencias entre Local y Atlas");
      console.log("💡 Ejecuta 'node sync-to-atlas.js' para sincronizar");
    }
    
    // Información adicional
    console.log("\n📋 Información adicional:");
    console.log(`🏠 Local DB: planzzz (${LOCAL_URI})`);
    console.log(`🌐 Atlas DB: frutos-secos`);
    console.log(`🔗 App URL: https://ecommerce-2ni7hzrd6-victorhernandezvivanco75-6138s-projects.vercel.app`);
    
  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
    console.log("\n💡 Posibles causas:");
    console.log("   • MongoDB local no está ejecutándose");
    console.log("   • Sin conexión a internet");
    console.log("   • Credenciales de Atlas incorrectas");
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

// Ejecutar verificación
verifySync().catch(console.error);