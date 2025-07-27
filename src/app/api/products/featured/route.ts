import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/featured - Obtener productos destacados
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ featured: true });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}