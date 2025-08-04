// Cargar variables de entorno PRIMERO
import "dotenv/config";

import { MongoClient } from "mongodb";

const categories = [
  {
    name: "* Frutos Secos *",
    slug: "FrutosSecos",
    color: "#4ECDC4",
    image: "/uploads/categories/frutos-secos.png",
    textColor: "#000000",
    isActive: true,
    order: 1,
  },
  {
    name: "* Frutas Deshidratadas *",
    slug: "FrutasDeshidratadas",
    color: "#D4A574",
    image: "/uploads/categories/frutas-deshidratadas.png",
    textColor: "#000000",
    isActive: true,
    order: 2,
  },
  {
    name: "* Despensa *",
    slug: "Despensa",
    color: "#E91E63",
    image: "/uploads/categories/despensa.png",
    textColor: "#000000",
    isActive: true,
    order: 3,
  },
  {
    name: "* Semillas *",
    slug: "Semillas",
    color: "#8BC34A",
    image: "/uploads/categories/semillas.png",
    textColor: "#000000",
    isActive: true,
    order: 4,
  },
  {
    name: "* Mix *",
    slug: "Mix",
    color: "#FF9800",
    image: "/uploads/categories/mix.png",
    textColor: "#000000",
    isActive: true,
    order: 5,
  },
  {
    name: "* Cereales *",
    slug: "Cereales",
    color: "#8D6E63",
    image: "/uploads/categories/cereales.png",
    textColor: "#000000",
    isActive: true,
    order: 6,
  },
  {
    name: "* Snack *",
    slug: "Snack",
    color: "#FF9800",
    image: "/uploads/categories/snack.png",
    textColor: "#000000",
    isActive: true,
    order: 7,
  },
];

async function migrateCategories() {
  // Verificar que existe la URI de MongoDB
  if (!process.env.MONGODB_URI) {
    console.error(
      "❌ Error: MONGODB_URI no está definido en las variables de entorno"
    );
    console.log("💡 Verifica tu archivo .env.local");
    console.log(
      "💡 Contenido esperado: MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos"
    );
    process.exit(1);
  }

  console.log("🔗 Conectando a MongoDB:", process.env.MONGODB_URI);
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db();
    const collection = db.collection("categories");

    // Verificar si ya existen categorías
    const existingCount = await collection.countDocuments();
    console.log(`📊 Categorías existentes: ${existingCount}`);

    if (existingCount > 0) {
      console.log("🗑️ Eliminando categorías existentes...");
      await collection.deleteMany({});
    }

    // Insertar nuevas categorías
    console.log("📝 Insertando nuevas categorías...");
    const result = await collection.insertMany(
      categories.map((cat) => ({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    console.log(
      `✅ Migración completada: ${result.insertedCount} categorías insertadas`
    );

    // Mostrar las categorías insertadas
    console.log("\n📋 Categorías insertadas:");
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("❌ Error en migración:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Conexión cerrada");
  }
}

// Ejecutar migración
migrateCategories();
