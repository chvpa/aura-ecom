import { NextRequest, NextResponse } from 'next/server';
import { getProducts, type ProductFilters, type PaginationParams } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: ProductFilters = {};
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
    };

    const brands = searchParams.get('brands');
    if (brands) {
      filters.brands = brands.split(',').filter(Boolean);
    }

    const families = searchParams.get('families');
    if (families) {
      filters.families = families.split(',').filter(Boolean);
    }

    const priceMin = searchParams.get('priceMin');
    if (priceMin) {
      filters.priceMin = parseInt(priceMin, 10);
    }

    const priceMax = searchParams.get('priceMax');
    if (priceMax) {
      filters.priceMax = parseInt(priceMax, 10);
    }

    const gender = searchParams.get('gender');
    if (gender) {
      filters.gender = gender;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const productIds = searchParams.get('productIds');
    if (productIds) {
      filters.productIds = productIds.split(',').filter(Boolean);
    }

    const response = await getProducts(filters, pagination);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

