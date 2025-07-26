import express from "express";
import cors from "cors";
import connectDB from "../backendconfig/db.js";
import dotenv from "dotenv";
import authRoutes from "../backendroutes/auth.js";
import productsRoutes from "../backendroutes/products.js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Frutos Secos Premium funcionando correctamente",
    timestamp: new Date().toISOString(),
    database: process.env.MONGODB_URI ? "Configurada" : "No configurada",
  });
});

// Middleware de manejo de errores
app.use((err, req, res) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    message: "🔍 Ruta no encontrada",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 API disponible en: http://localhost:${PORT}`);
  console.log(`🔐 Rutas de autenticación: http://localhost:${PORT}/api/auth`);
  console.log(`📦 Rutas de productos: http://localhost:${PORT}/api/products`);
});
