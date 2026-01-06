import { BrandForm } from '@/features/admin/components/BrandForm';

export const dynamic = 'force-dynamic';

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Marca</h1>
        <p className="text-muted-foreground">
          Agrega una nueva marca al catálogo
        </p>
      </div>

      <BrandForm />
    </div>
  );
}

