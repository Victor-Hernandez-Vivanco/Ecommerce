// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//   throw new Error('Por favor define la variable MONGODB_URI en .env.local');
// }

// let cached = (global as any).mongoose;

// if (!cached) {
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       console.log('✅ Conectado a MongoDB');
//       return mongoose;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// }

// export default connectDB;

// src/lib/mongodb.ts
import mongoose, { Mongoose } from "mongoose";

/**
 * URI de conexión a MongoDB, obtenida desde variables de entorno.
 * El operador "!" le dice a TypeScript que no será null ni undefined.
 */
const MONGODB_URI: string = process.env.MONGODB_URI!;

/**
 * Validamos que la URI exista para evitar errores silenciosos.
 */
if (!MONGODB_URI) {
  throw new Error(
    "❌ Falta definir la variable MONGODB_URI en el archivo .env.local"
  );
}

/**
 * Estructura para guardar el estado de conexión en memoria global.
 * Esto evita múltiples conexiones en entornos con recarga en caliente (Hot Reload), como Next.js.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Creamos o reutilizamos el objeto global de caché
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Función para conectar a MongoDB usando Mongoose con manejo de caché.
 */
async function connectDB(): Promise<Mongoose> {
  // Si ya existe una conexión, la reutilizamos
  if (cached.conn) {
    return cached.conn;
  }

  // Si no hay una conexión en curso, la creamos
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Evita que Mongoose almacene operaciones antes de conectar
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    // Guardamos la conexión establecida
    cached.conn = await cached.promise;
  } catch (error) {
    // Si algo falla, limpiamos la promesa para poder reintentar
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
