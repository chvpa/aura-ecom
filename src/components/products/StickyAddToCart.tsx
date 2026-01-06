'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatPrice, formatPriceWithDiscount } from '@/lib/utils/formatters';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface StickyAddToCartProps {
  product: Product;
  onAddToCart: () => void;
}

export function StickyAddToCart({ product, onAddToCart }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsVisible(scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  const hasDiscount =
    product.original_price_pyg && product.original_price_pyg > product.price_pyg;
  const priceInfo = hasDiscount
    ? formatPriceWithDiscount(product.original_price_pyg!, product.price_pyg)
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {hasDiscount && priceInfo ? (
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-primary">
                  {priceInfo.discounted}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  {priceInfo.original}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-primary">
                {formatPrice(product.price_pyg)}
              </p>
            )}
            {product.stock > 0 && product.stock < 5 && (
              <p className="text-xs text-amber-600">
                Solo quedan {product.stock} unidades
              </p>
            )}
          </div>
          <Button
            size="lg"
            className="flex-shrink-0 font-semibold"
            disabled={product.stock === 0}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

