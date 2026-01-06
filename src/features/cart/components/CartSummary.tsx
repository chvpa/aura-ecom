'use client';

import { CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '../hooks/useCart';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
}

export function CartSummary({
  showCheckoutButton = false,
  onCheckout,
}: CartSummaryProps) {
  const { subtotal, itemCount } = useCart();

  // El costo de envío se calcula en checkout, aquí siempre es 0
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
          </span>
        </div>
        {itemCount >= 3 && (
          <p className="text-xs text-green-600">
            🎉 ¡Envío gratis por comprar 3 o más unidades!
          </p>
        )}
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
      {showCheckoutButton && onCheckout && (
        <Button
          onClick={onCheckout}
          className="w-full"
          size="lg"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Finalizar compra
        </Button>
      )}
    </div>
  );
}

