import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Advertisement from "@/models/Advertisement";
import * as jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Interfaz para el payload del JWT
interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Interfaz para datos de actualización
interface UpdateAdvertisementData {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  type?: 'product' | 'promotion' | 'banner';
  order?: number;
  isActive?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  updatedAt: Date;
}

// GET - Obtener advertisement por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiar tipo
) {
  try {
    const { id } = await params; // ✅ Await params
    
    // Verificar autenticación admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) { // ✅ Usar id en lugar de params.id
      return NextResponse.json(
        { message: "ID de advertisement inválido" },
        { status: 400 }
      );
    }

    const advertisement = await Advertisement.findById(id); // ✅ Usar id

    if (!advertisement) {
      return NextResponse.json(
        { message: "Advertisement no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(advertisement);
  } catch (error) {
    console.error("Error obteniendo advertisement:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar advertisement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiar tipo
) {
  try {
    const { id } = await params; // ✅ Await params
    
    // Verificar autenticación admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // ✅ CORREGIDO: Tipo específico en lugar de 'any'
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) { // ✅ Usar id
      return NextResponse.json(
        { message: "ID de advertisement inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      type,
      order,
      isActive,
      startDate,
      endDate,
    } = body;

    // ✅ CORREGIDO: Tipo específico en lugar de 'any'
    const updateData: UpdateAdvertisementData = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;

    const advertisement = await Advertisement.findByIdAndUpdate(
      id, // ✅ Usar id
      updateData,
      { new: true, runValidators: true }
    );

    if (!advertisement) {
      return NextResponse.json(
        { message: "Advertisement no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Advertisement actualizado exitosamente",
      advertisement,
    });
  } catch (error) {
    console.error("Error actualizando advertisement:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar advertisement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiar tipo
) {
  try {
    const { id } = await params; // ✅ Await params
    
    // Verificar autenticación admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) { // ✅ Usar id
      return NextResponse.json(
        { message: "ID de advertisement inválido" },
        { status: 400 }
      );
    }

    const advertisement = await Advertisement.findByIdAndDelete(id); // ✅ Usar id

    if (!advertisement) {
      return NextResponse.json(
        { message: "Advertisement no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Advertisement eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando advertisement:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
