// ✅ CORREGIDO: Solo importar lo que se usa
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Advertisement from "@/models/Advertisement";

// GET - Obtener advertisements activos para el carrusel
export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // ✅ CORREGIDO: Query MongoDB con sintaxis correcta
    const advertisements = await Advertisement
      .find({
        isActive: true,
        // Condición para startDate: debe ser null, no existir, o menor/igual a ahora
        $and: [
          {
            $or: [
              { startDate: { $exists: false } },
              { startDate: null },
              { startDate: { $lte: now } }
            ]
          },
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: null },
              { endDate: { $gte: now } }
            ]
          }
        ]
      })
      .sort({ order: 1, createdAt: -1 })
      .select('title description imageUrl linkUrl type order')
      .lean();

    return NextResponse.json({ advertisements });

  } catch (error) {
    console.error("Error obteniendo advertisements activos:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}