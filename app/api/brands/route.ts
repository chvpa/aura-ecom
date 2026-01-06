import { NextResponse } from 'next/server';
import { getBrands } from '@/lib/services/brands';

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error in brands API:', error);
    return NextResponse.json(
      { error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}

