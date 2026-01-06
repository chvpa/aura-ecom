import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBrands } from '@/lib/services/brands';
import { ProductForm } from '@/features/admin/components/ProductForm';
import type { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

type Product = Database['public']['Tables']['products']['Row'];

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await (supabase
    .from('products') as any)
    .select('*')
    .eq('id', id)
    .single() as { data: Product | null; error: any };

  if (error || !product) {
    redirect('/admin/productos');
  }

  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
        <p className="text-muted-foreground">
          Modifica la información del producto: {product.name}
        </p>
      </div>

      <ProductForm product={product} brands={brands} />
    </div>
  );
}
