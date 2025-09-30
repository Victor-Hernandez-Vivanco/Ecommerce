import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Obtener todas las categorías
export async function GET() {
  try {
    await connectDB();

    // Buscar TODAS las categorías primero
    const allCategories = await Category.find({}).lean();

    // Buscar solo las activas
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
      debug: {
        total: allCategories.length,
        active: categories.length,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener categorías",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría (solo admin)
export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Token de administrador requerido" },
        { status: 401 }
      );
    }

    // Verificar token admin aquí

    await connectDB();
    const body = await request.json();

    const category = new Category(body);
    await category.save();

    return NextResponse.json({
      success: true,
      category,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error al crear categoría" },
      { status: 500 }
    );
  }
}
