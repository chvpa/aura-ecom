import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingCost } from '@/features/checkout/utils/shipping';
import type { CartItem } from '@/features/cart/types/cart.types';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, department } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items requeridos' },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento requerido' },
        { status: 400 }
      );
    }

    const cost = calculateShippingCost(items as CartItem[], department as ParaguayDepartment);
    const isFree = cost === 0;

    return NextResponse.json({
      cost,
      isFree,
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al calcular costo de envío',
      },
      { status: 500 }
    );
  }
}

