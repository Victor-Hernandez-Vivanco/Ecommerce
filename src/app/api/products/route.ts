import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdminToken } from "@/utils/auth";

// ✅ INTERFACES AGREGADAS
interface PriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

// GET /api/products - Obtener todos los productos
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch {
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
      categories, // ✅ AGREGAR CAMPO FALTANTE
      featured,
      isAdvertisement, // ✅ AGREGAR CAMPO FALTANTE
      isMainCarousel, // ✅ AGREGAR CAMPO FALTANTE
      discount,
    } = body;

    // ✅ VALIDACIONES ACTUALIZADAS
    if (!name || !description || !pricePerKilo || !category) {
      return NextResponse.json(
        { message: "Todos los campos requeridos deben ser completados" },
        { status: 400 }
      );
    }

    // ✅ VALIDAR CATEGORÍAS MÚLTIPLES
    if (categories && categories.length === 0) {
      return NextResponse.json(
        { message: "Debe seleccionar al menos una categoría" },
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

    // ✅ CREAR PRODUCTO CON TODOS LOS CAMPOS NUEVOS
    const newProduct = new Product({
      name,
      description,
      pricePerKilo,
      pricesByWeight,
      images,
      category,
      categories: categories || [category], // ✅ USAR categories O FALLBACK
      featured: featured || false,
      isAdvertisement: isAdvertisement || false, // ✅ NUEVO CAMPO
      isMainCarousel: isMainCarousel || false, // ✅ NUEVO CAMPO
      discount: discount || 0,
    });

    const product = await newProduct.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
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
