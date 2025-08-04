import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdminToken } from "@/lib/auth";

// GET /api/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const params = await context.params;

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const params = await context.params;

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Producto eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
