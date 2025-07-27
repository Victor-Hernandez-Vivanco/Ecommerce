import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Intento de login de admin');
    await connectDB();
    
    const { email, password } = await request.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 400 }
      );
    }

    // Verificar que sea admin
    if (user.role !== 'admin') {
      console.log('❌ Usuario no es admin:', email);
      return NextResponse.json(
        { message: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Contraseña inválida para admin:', email);
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 400 }
      );
    }

    // Generar token de admin
    const adminToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isAdmin: true
      },
      process.env.JWT_SECRET || 'tu_jwt_secret',
      { expiresIn: '4h' }
    );

    console.log('✅ Login de admin exitoso:', email);
    console.log('🔑 Token generado:', adminToken.substring(0, 20) + '...');

    // ✅ DEVOLVER EL TOKEN EN LA RESPUESTA
    return NextResponse.json({
      message: 'Login de admin exitoso',
      token: adminToken, // ← ✅ AGREGAR ESTA LÍNEA
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login de admin:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}