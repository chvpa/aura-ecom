'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyState } from '@/components/products/EmptyState';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';

interface CartDrawerProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({
  children,
  open,
  onOpenChange,
}: CartDrawerProps) {
  const router = useRouter();
  const { items, itemCount } = useCart();

  const handleCheckout = () => {
    onOpenChange?.(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    onOpenChange?.(false);
    router.push('/carrito');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="right" className="w-full sm:w-[400px] bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-lg">Carrito ({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-120px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Tu carrito está vacío"
                description="Agrega productos para comenzar a comprar"
                actionLabel="Explorar Perfumes"
                onAction={() => {
                  onOpenChange?.(false);
                  router.push('/perfumes');
                }}
              />
            </div>
          ) : (
            <>
              {/* Barra de progreso envío gratis */}
              <div className="mb-4">
                <FreeShippingProgress />
              </div>

              {/* Lista de items */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-2">
                  {items.map((item) => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </div>
              </div>

              {/* Resumen */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <CartSummary
                  showCheckoutButton
                  onCheckout={handleCheckout}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewCart}
                >
                  Ver carrito completo
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

