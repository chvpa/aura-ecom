'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface OrderItemImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: boolean;
}

export function OrderItemImage({ src, alt, fallback = false }: OrderItemImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || '/placeholder-product.jpg');

  if (fallback || hasError || !imageSrc || imageSrc === '/placeholder-product.jpg') {
    return (
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
        onError={() => {
          setHasError(true);
          setImageSrc('/placeholder-product.jpg');
        }}
      />
    </div>
  );
}

