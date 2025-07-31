import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Advertisement from "@/models/Advertisement";
import * as jwt from "jsonwebtoken";

// Interfaz para el payload del JWT
interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Interfaz para filtros de búsqueda
interface AdvertisementFilters {
  isActive?: boolean;
  type?: 'product' | 'promotion' | 'banner';
}

// Interfaz para datos de creación
interface CreateAdvertisementData {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  type?: 'product' | 'promotion' | 'banner';
  order?: number;
  startDate?: Date;
  endDate?: Date;
}

// GET - Listar advertisements
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const skip = (page - 1) * limit;

    // ✅ CORREGIDO: Tipo específico en lugar de 'any'
    const filters: AdvertisementFilters = {};
    if (isActive !== null && isActive !== undefined) {
      filters.isActive = isActive === "true";
    }
    if (type) {
      filters.type = type as 'product' | 'promotion' | 'banner';
    }

    // Obtener advertisements con paginación
    const advertisements = await Advertisement.find(filters)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Advertisement.countDocuments(filters);

    return NextResponse.json({
      advertisements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo advertisements:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear advertisement
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      type,
      order,
      startDate,
      endDate,
    } = body;

    // Validaciones
    if (!title) {
      return NextResponse.json(
        { message: "El título es requerido" },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { message: "La URL de imagen es requerida" },
        { status: 400 }
      );
    }

    // ✅ MEJORADO: Datos tipados para creación
    const advertisementData: CreateAdvertisementData = {
      title,
      description,
      imageUrl,
      linkUrl,
      type: type || "promotion",
      order: order || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Crear advertisement
    const advertisement = new Advertisement(advertisementData);
    await advertisement.save();

    return NextResponse.json(
      {
        message: "Advertisement creado exitosamente",
        advertisement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando advertisement:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
