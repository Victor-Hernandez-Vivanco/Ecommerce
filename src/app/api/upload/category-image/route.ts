import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

// Interfaz para el token decodificado
interface DecodedToken {
  userId: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
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
    ) as DecodedToken;
    return decoded.isAdmin ? decoded : null;
  } catch {
    return null;
  }
};

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

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const categoryName = formData.get("categoryName") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No se encontró archivo de imagen" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "image/svg+xml",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Tipo de archivo no válido. Use SVG, JPG, PNG o WebP." },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo es demasiado grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const sanitizedCategoryName = categoryName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${sanitizedCategoryName}.${fileExtension}`;

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "public", "uploads", "categories");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // El directorio ya existe
    }

    // Guardar archivo
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL del archivo
    const imageUrl = `/uploads/categories/${fileName}`;

    return NextResponse.json({
      message: "Imagen de categoría subida exitosamente",
      imageUrl,
      fileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch {
    return NextResponse.json(
      { message: "Error del servidor al subir imagen" },
      { status: 500 }
    );
  }
}
