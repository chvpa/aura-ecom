import { NextResponse } from 'next/server';
import { getMaxPrice } from '@/lib/services/products';

export async function GET() {
  try {
    const maxPrice = await getMaxPrice();
    return NextResponse.json({ maxPrice });
  } catch (error) {
    console.error('Error in max-price API:', error);
    return NextResponse.json(
      { error: 'Error al obtener precio máximo' },
      { status: 500 }
    );
  }
}

