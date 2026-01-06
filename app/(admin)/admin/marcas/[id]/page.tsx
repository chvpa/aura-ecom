import { redirect } from 'next/navigation';
import { getBrandByIdAdmin } from '@/features/admin/services/brandAdminService';
import { BrandForm } from '@/features/admin/components/BrandForm';

export const dynamic = 'force-dynamic';

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandByIdAdmin(id);

  if (!brand) {
    redirect('/admin/marcas');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Marca</h1>
        <p className="text-muted-foreground">
          Modifica la información de la marca: {brand.name}
        </p>
      </div>

      <BrandForm brand={brand} />
    </div>
  );
}

