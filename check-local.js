import { MongoClient } from "mongodb";


//node check-local.js

const LOCAL_URI = "mongodb://localhost:27017/planzzz";

async function checkLocalData() {
  console.log("🔍 Verificando datos locales...");
  
  try {
    const client = new MongoClient(LOCAL_URI);
    await client.connect();
    console.log("✅ Conectado a MongoDB local");
    
    const db = client.db();
    
    // Verificar colecciones
    const collections = await db.listCollections().toArray();
    console.log("\n📂 Colecciones encontradas:");
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Contar documentos
    const productCount = await db.collection("products").countDocuments();
    const userCount = await db.collection("users").countDocuments();
    const categoryCount = await db.collection("categories").countDocuments();
    
    console.log("\n📊 Conteo de documentos:");
    console.log(`📦 Productos: ${productCount}`);
    console.log(`👤 Usuarios: ${userCount}`);
    console.log(`📂 Categorías: ${categoryCount}`);
    
    // Mostrar algunos productos si existen
    if (productCount > 0) {
      console.log("\n📦 Productos encontrados:");
      const products = await db.collection("products").find({}).limit(5).toArray();
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.pricePerKilo}`);
      });
    }
    
    await client.close();
    
  } catch (error) {
    console.log("❌ No se pudo conectar a MongoDB local:", error.message);
    console.log("💡 Asegúrate de que MongoDB esté ejecutándose localmente");
  }
}

checkLocalData();