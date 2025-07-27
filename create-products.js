import { MongoClient } from "mongodb";

// Configuración de MongoDB
const MONGODB_URI = "mongodb://localhost:27017/planzzz";

const sampleProducts = [
  {
    name: "Almendras Premium",
    description:
      "Almendras naturales de la mejor calidad, ricas en vitamina E y proteínas.",
    price: 7890,
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop&crop=center",
    category: "Frutos Secos",
    stock: 25,
    featured: true,
    discount: 0,
  },
  {
    name: "Nueces de California",
    description: "Nueces frescas importadas de California, ricas en omega-3.",
    price: 11990,
    image:
      "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop&crop=center",
    category: "Frutos Secos",
    stock: 18,
    featured: true,
    discount: 10,
  },
  {
    name: "Pistachos Tostados",
    description: "Pistachos tostados con sal marina, perfectos para snacks.",
    price: 15990,
    image:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop&crop=center",
    category: "Frutos Secos",
    stock: 12,
    featured: true,
    discount: 0,
  },
  {
    name: "Avellanas Enteras",
    description: "Avellanas enteras sin cáscara, ideales para repostería.",
    price: 9890,
    image:
      "https://images.unsplash.com/photo-1605027990121-3b2c6c8b5b4e?w=400&h=300&fit=crop&crop=center",
    category: "Frutos Secos",
    stock: 30,
    featured: false,
    discount: 5,
  },
  {
    name: "Mix de Frutos Secos",
    description: "Mezcla especial de frutos secos premium para toda ocasión.",
    price: 12990,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    category: "Mixes",
    stock: 20,
    featured: true,
    discount: 15,
  },
  {
    name: "Semillas de Girasol",
    description:
      "Semillas de girasol tostadas, ricas en vitaminas y minerales.",
    price: 4990,
    image:
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&crop=center",
    category: "Semillas",
    stock: 40,
    featured: false,
    discount: 0,
  },
];

async function createProducts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("🔗 Conectado a MongoDB");

    const db = client.db();
    const collection = db.collection("products");

    // Limpiar productos existentes
    await collection.deleteMany({});
    console.log("🗑️ Productos anteriores eliminados");

    // Insertar productos de ejemplo
    const result = await collection.insertMany(sampleProducts);
    console.log(`✅ ${result.insertedCount} productos creados exitosamente`);

    // Mostrar productos creados
    const products = await collection.find({}).toArray();
    console.log("📦 Productos en la base de datos:");
    products.forEach((product) => {
      console.log(`- ${product.name} ($${product.price})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Conexión cerrada");
  }
}

createProducts();
