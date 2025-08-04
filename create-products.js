// ✅ Script para limpiar productos (sin crear productos de ejemplo)
import "dotenv/config";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/planzzz";

if (!process.env.MONGODB_URI) {
  console.log("⚠️ Usando MongoDB local por defecto");
} else {
  console.log("🌐 Usando MongoDB desde variable de entorno");
}

async function clearProducts() {
  console.log("🔗 Conectando a:", MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db();
    const collection = db.collection("products");

    // Verificar productos existentes
    const existingCount = await collection.countDocuments();
    console.log(`📊 Productos existentes: ${existingCount}`);

    if (existingCount > 0) {
      console.log("🗑️ Eliminando todos los productos...");
      const result = await collection.deleteMany({});
      console.log(`✅ ${result.deletedCount} productos eliminados`);
    } else {
      console.log("ℹ️ No hay productos para eliminar");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Conexión cerrada");
  }
}

clearProducts();