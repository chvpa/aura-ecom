import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/utils/admin';
import { createProduct } from '@/features/admin/services/productAdminService';
import { productSchema } from '@/lib/validations/product';
import type { ProductFormData } from '@/lib/validations/product';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface BulkImportRequest {
  products: Partial<ProductFormData>[];
}

interface ImportResult {
  success: boolean;
  productId?: string;
  rowNumber: number;
  errors?: string[];
}

interface BulkImportResponse {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: ImportResult[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const userIsAdmin = await isAdmin(user.id);

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body: BulkImportRequest = await request.json();

    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json(
        { error: 'Formato inválido: se espera un array de productos' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const results: ImportResult[] = [];
    let successful = 0;
    let failed = 0;

    // Validar que las marcas existan antes de procesar
    const brandIds = new Set(
      body.products
        .map((p) => p.brand_id)
        .filter((id): id is string => Boolean(id))
    );

    if (brandIds.size > 0) {
      const { data: existingBrands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .in('id', Array.from(brandIds));

      if (brandsError) {
        return NextResponse.json(
          { error: `Error al validar marcas: ${brandsError.message}` },
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const validBrandIds = new Set(
        existingBrands?.map((b: { id: string }) => b.id) || []
      );
      const invalidBrandIds = Array.from(brandIds).filter(
        (id) => !validBrandIds.has(id)
      );

      if (invalidBrandIds.length > 0) {
        return NextResponse.json(
          {
            error: `Marcas no encontradas: ${invalidBrandIds.join(', ')}`,
          },
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Procesar productos en batches de 50
    const BATCH_SIZE = 50;
    const batches: Partial<ProductFormData>[][] = [];

    for (let i = 0; i < body.products.length; i += BATCH_SIZE) {
      batches.push(body.products.slice(i, i + BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      for (let productIndex = 0; productIndex < batch.length; productIndex++) {
        const productData = batch[productIndex];
        const rowNumber = batchIndex * BATCH_SIZE + productIndex + 1;
        const errors: string[] = [];

        // Validar con Zod schema
        const validationResult = productSchema.safeParse(productData);

        if (!validationResult.success) {
          validationResult.error.issues.forEach((err) => {
            errors.push(`${err.path.join('.')}: ${err.message}`);
          });

          results.push({
            success: false,
            rowNumber,
            errors,
          });
          failed++;
          continue;
        }

        // Las imágenes no vienen del Excel, usar placeholder temporal
        // El usuario debe agregar imágenes manualmente después
        if (
          !validationResult.data.images ||
          validationResult.data.images.length === 0
        ) {
          // Usar un placeholder temporal - el usuario debe agregar imágenes después
          validationResult.data.images = ['https://via.placeholder.com/400x400?text=Sin+Imagen'];
          validationResult.data.main_image_url = validationResult.data.images[0];
        }

        // Verificar duplicados de SKU y slug
        const { data: existingProducts } = await (supabase
          .from('products') as any)
          .select('id, sku, slug')
          .or(`sku.eq.${validationResult.data.sku},slug.eq.${validationResult.data.slug}`)
          .limit(1) as { data: Array<{ id: string; sku: string; slug: string }> | null; error: any };

        if (existingProducts && existingProducts.length > 0) {
          const existing = existingProducts[0];
          if (existing.sku === validationResult.data.sku) {
            errors.push(`SKU duplicado: ${validationResult.data.sku}`);
          }
          if (existing.slug === validationResult.data.slug) {
            errors.push(`Slug duplicado: ${validationResult.data.slug}`);
          }

          if (errors.length > 0) {
            results.push({
              success: false,
              rowNumber,
              errors,
            });
            failed++;
            continue;
          }
        }

        try {
          // Crear producto
          const product = await createProduct(validationResult.data);

          results.push({
            success: true,
            productId: product.id,
            rowNumber,
          });
          successful++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error desconocido';
          errors.push(errorMessage);

          results.push({
            success: false,
            rowNumber,
            errors,
          });
          failed++;
        }
      }
    }

    const response: BulkImportResponse = {
      success: failed === 0,
      total: body.products.length,
      successful,
      failed,
      results,
    };

    return NextResponse.json(response, {
      status: failed === 0 ? 200 : 207, // 207 Multi-Status si hay algunos fallos
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en importación masiva:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar importación masiva',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

