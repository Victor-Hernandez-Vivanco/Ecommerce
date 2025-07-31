import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Token no proporcionado" },
        { status: 403 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secret"
    ) as DecodedToken;

    if (!decoded.isAdmin) {
      return NextResponse.json(
        { message: "No es administrador" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Token válido", isAdmin: true },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 403 }
    );
  }
}
