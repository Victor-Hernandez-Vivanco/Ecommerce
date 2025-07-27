import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

// ✅ INTERFACES AGREGADAS
interface PriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

// Función para verificar token de admin
const verifyAdminToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secret"
    ) as { isAdmin: boolean };
    return decoded.isAdmin ? decoded : null;
  } catch {
    return null;
  }
};

// GET /api/products - Obtener todos los productos
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear nuevo producto (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const adminUser = verifyAdminToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores." },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();

    const {
      name,
      description,
      pricePerKilo,
      pricesByWeight,
      images,
      category,
      featured,
      discount,
    } = body;

    // ✅ VALIDACIONES ACTUALIZADAS
    if (!name || !description || !pricePerKilo || !category) {
      return NextResponse.json(
        { message: "Todos los campos requeridos deben ser completados" },
        { status: 400 }
      );
    }

    if (!pricesByWeight || pricesByWeight.length === 0) {
      return NextResponse.json(
        { message: "Debe especificar al menos un precio por peso" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { message: "Debe subir al menos una imagen" },
        { status: 400 }
      );
    }

    // ✅ AHORA FUNCIONA: PriceByWeight está definida
    const hasStock = pricesByWeight.some((p: PriceByWeight) => p.stock > 0);
    if (!hasStock) {
      return NextResponse.json(
        { message: "Debe especificar stock para al menos un peso" },
        { status: 400 }
      );
    }

    // ✅ CREAR PRODUCTO CON NUEVO MODELO
    const newProduct = new Product({
      name,
      description,
      pricePerKilo,
      pricesByWeight,
      images,
      category,
      featured: featured || false,
      discount: discount || 0,
    });

    const product = await newProduct.save();
    console.log("✅ Producto creado:", product.name);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);

    // ✅ MEJOR MANEJO DE ERRORES DE VALIDACIÓN
    if (error instanceof Error) {
      if (error.message.includes("validation failed")) {
        return NextResponse.json(
          { message: "Error de validación: " + error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
