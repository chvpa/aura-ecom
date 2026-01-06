'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { EmptyState } from '@/components/products/EmptyState';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';
import { ShoppingBag } from 'lucide-react';

export function CartPageClient() {
  const router = useRouter();
  const { items } = useCart();

  // Validar stock antes de permitir checkout
  const hasOutOfStockItems = items.some((item) => item.quantity > item.stock);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <EmptyState
          title="Tu carrito está vacío"
          description="Agrega productos para comenzar a comprar"
          actionLabel="Explorar Perfumes"
          onAction={() => router.push('/perfumes')}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Lista de productos */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Productos en tu carrito</h2>
          <div className="divide-y">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border p-4 sm:p-6 sticky top-4 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Resumen de compra</h2>
          
          {/* Barra de progreso envío gratis */}
          <FreeShippingProgress />
          
          {hasOutOfStockItems && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Algunos productos tienen stock insuficiente. Por favor ajusta las cantidades antes de continuar.
              </p>
            </div>
          )}
          <CartSummary
            showCheckoutButton={!hasOutOfStockItems}
            onCheckout={() => router.push('/checkout')}
          />
          <Link href="/perfumes" className="block mt-4 text-center text-sm text-muted-foreground hover:text-primary transition-colors">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

