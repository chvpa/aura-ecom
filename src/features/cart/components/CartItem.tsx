'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '@/lib/utils/formatters';
import type { CartItem as CartItemType } from '../types/cart.types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.productId);
      return;
    }
    updateQuantity(item.productId, newQuantity);
  };

  return (
    <div className="flex gap-3 py-3">
      {/* Imagen - Más grande */}
      <Link href={`/perfumes/${item.slug}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-neutral-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </Link>

      {/* Información */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link href={`/perfumes/${item.slug}`}>
            <h3 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPrice(item.price)} c/u
          </p>
        </div>

        {/* Controles y precio total */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-6 text-center text-xs font-medium">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="font-bold text-primary text-sm">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        </div>

        {item.stock < 5 && item.stock > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Solo quedan {item.stock} unidades
          </p>
        )}
      </div>
    </div>
  );
}

