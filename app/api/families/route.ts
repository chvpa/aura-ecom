import { NextResponse } from 'next/server';
import { getOlfactoryFamilies } from '@/lib/services/families';

export async function GET() {
  try {
    const families = await getOlfactoryFamilies();
    return NextResponse.json(families);
  } catch (error) {
    console.error('Error in families API:', error);
    return NextResponse.json(
      { error: 'Error al obtener familias olfativas' },
      { status: 500 }
    );
  }
}

