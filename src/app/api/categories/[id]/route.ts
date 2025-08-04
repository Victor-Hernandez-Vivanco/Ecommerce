import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// PUT - Actualizar categoría
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const adminToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Token de administrador requerido" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const category = await Category.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría (soft delete)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const adminToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Token de administrador requerido" },
        { status: 401 }
      );
    }

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}