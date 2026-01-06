import { getBrands } from '@/lib/services/brands';
import { ProductForm } from '@/features/admin/components/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Producto</h1>
        <p className="text-muted-foreground">
          Agrega un nuevo producto al catálogo
        </p>
      </div>

      <ProductForm brands={brands} />
    </div>
  );
}
