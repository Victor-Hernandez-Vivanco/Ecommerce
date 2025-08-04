import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Obtener todas las categorías
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener categorías" },
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
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Error al crear categoría" },
      { status: 500 }
    );
  }
}
