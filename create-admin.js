// ✅ AGREGAR AL INICIO
import "dotenv/config";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

// ✅ CAMBIAR ESTA LÍNEA
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/planzzz";

if (!process.env.MONGODB_URI) {
  console.log("⚠️ Usando MongoDB local por defecto");
} else {
  console.log("🌐 Usando MongoDB desde variable de entorno");
}

async function createAdmin() {
  console.log("🔗 Conectando a:", MONGODB_URI);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db();
    const collection = db.collection("users");

    // Verificar si ya existe un admin
    const existingAdmin = await collection.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Ya existe un usuario administrador:", existingAdmin.email);
      return;
    }

    // Crear usuario administrador
    const adminData = {
      email: "admin@frutossecos.com",
      password: await bcrypt.hash("admin123", 12),
      role: "admin",
      name: "Administrador",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(adminData);
    console.log("✅ Usuario administrador creado exitosamente");
    console.log("📧 Email: admin@frutossecos.com");
    console.log("🔑 Password: admin123");
    console.log("🆔 ID:", result.insertedId);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Conexión cerrada");
  }
}

createAdmin();
