import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { env } from "@/config/env";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    interface JwtPayload {
      userId: string;
      email: string;
      role: string;
      isAdmin: boolean;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Verificar que sea admin
    if (!decoded.isAdmin || decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores." },
        { status: 403 }
      );
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Usuario admin no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error en verificación de admin:", error);
    return NextResponse.json({ message: "Token inválido" }, { status: 403 });
  }
}
