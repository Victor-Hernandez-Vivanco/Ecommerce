import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secret"
    ) as JwtPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // ✅ Agregar el role
      },
    });
  } catch (error) {
    console.error("❌ Error en verificación:", error);
    return NextResponse.json({ message: "Token inválido" }, { status: 403 });
  }
}
