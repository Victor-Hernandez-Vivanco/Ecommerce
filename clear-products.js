import { MongoClient } from "mongodb";

// Configuración de MongoDB
const MONGODB_URI = "mongodb://localhost:27017/planzzz";

async function clearProducts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("🔗 Conectado a MongoDB");

    const db = client.db();
    const collection = db.collection("products");

    // Eliminar todos los productos
    const result = await collection.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} productos eliminados`);

    console.log("✅ Base de datos limpia - Lista para nuevos productos");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Conexión cerrada");
  }
}

clearProducts();
