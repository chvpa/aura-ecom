import { Suspense } from 'react';
import { CartPageClient } from './CartPageClient';
import { CartSkeleton } from '@/components/products/CartSkeleton';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
      <Suspense fallback={<CartSkeleton />}>
        <CartPageClient />
      </Suspense>
    </div>
  );
}

