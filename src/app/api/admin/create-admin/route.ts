import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password } = await request.json();
    
    // Verificar si ya existe un admin con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    return NextResponse.json({
      message: 'Admin creado exitosamente',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creando admin:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}