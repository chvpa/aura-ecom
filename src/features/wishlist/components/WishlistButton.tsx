'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../hooks/useWishlist';
import { cn } from '@/lib/utils/cn';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = false,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const inWishlist = isInWishlist(productId);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      disabled={loading}
      aria-label={inWishlist ? 'Eliminar de wishlist' : 'Agregar a wishlist'}
    >
      <Heart
        className={cn(
          'h-4 w-4',
          size === 'lg' && 'h-5 w-5',
          size === 'sm' && 'h-3.5 w-3.5',
          inWishlist && 'fill-primary text-primary'
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {inWishlist ? 'En wishlist' : 'Agregar a wishlist'}
        </span>
      )}
    </Button>
  );
}

