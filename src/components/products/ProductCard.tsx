'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchBadge } from './MatchBadge';
import { WishlistButton } from '@/features/wishlist/components/WishlistButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice, formatPriceWithDiscount } from '@/lib/utils/formatters';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  matchPercentage?: number;
  showWishlist?: boolean;
}

export function ProductCard({
  product,
  matchPercentage,
  showWishlist = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount =
    product.original_price_pyg &&
    product.original_price_pyg > product.price_pyg;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price_pyg,
      name: product.name,
      image: product.main_image_url,
      slug: product.slug,
      stock: product.stock,
    });
  };

  const priceInfo = hasDiscount
    ? formatPriceWithDiscount(
        product.original_price_pyg!,
        product.price_pyg
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group overflow-hidden h-full flex flex-col hover:shadow-card-hover transition-shadow">
        <CardHeader className="p-0 relative">
          <Link href={`/perfumes/${product.slug}`}>
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
              <Image
                src={product.main_image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              {matchPercentage !== undefined && (
                <div className="absolute top-2 right-2">
                  <MatchBadge percentage={matchPercentage} size="sm" />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="font-semibold">
                    -{priceInfo?.discountPercentage}%
                  </Badge>
                </div>
              )}
              {product.stock > 0 && product.stock < 5 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge variant="secondary" className="w-full justify-center bg-amber-500 text-white font-semibold">
                    ⚠️ Solo quedan {product.stock} unidades
                  </Badge>
                </div>
              )}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
          <Link href={`/perfumes/${product.slug}`}>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {product.size_ml}ml · {product.concentration}
            </p>
          </Link>
          <div className="mt-auto">
            {hasDiscount && priceInfo ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {priceInfo.discounted}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {priceInfo.original}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-lg font-bold text-primary">
                {formatPrice(product.price_pyg)}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </Button>
          {showWishlist && (
            <WishlistButton
              productId={product.id}
              variant="outline"
              size="sm"
            />
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

