import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await connectDB();
    console.log('✅ Conectado a MongoDB');
    
    const { email, password } = await request.json();
    console.log('📧 Login attempt for:', email);

    // Validaciones
    if (!email || !password) {
      console.log('❌ Faltan email o password');
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    console.log('🔍 Buscando usuario en DB...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 400 }
      );
    }

    console.log('👤 Usuario encontrado:', user.email);
    console.log('🔑 Role del usuario:', user.role); // ✅ Debug adicional

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Contraseña inválida');
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 400 }
      );
    }

    console.log('✅ Contraseña válida');

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || 'tu_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log('🎫 Token generado exitosamente');

    return NextResponse.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ AGREGAR EL ROLE
      },
    });
  } catch (error) {
    console.error('❌ Error completo en login:', error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}