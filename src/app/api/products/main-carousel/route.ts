import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/main-carousel - Obtener productos marcados para carrusel principal
export async function GET() {
  try {
    await connectDB();
    // ✅ FILTRAR POR isMainCarousel EN LUGAR DE usar productos estáticos
    const products = await Product.find({ isMainCarousel: true }).limit(12);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos del carrusel principal:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}