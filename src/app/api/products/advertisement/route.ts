import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/advertisement - Obtener productos marcados como publicidad
export async function GET() {
  try {
    await connectDB();
    // ✅ FILTRAR POR isAdvertisement EN LUGAR DE featured
    const products = await Product.find({ isAdvertisement: true });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos de publicidad:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}