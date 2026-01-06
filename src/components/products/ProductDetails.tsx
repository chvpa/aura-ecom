'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductGallery } from './ProductGallery';
import { OlfactoryNotes } from './OlfactoryNotes';
import { ProductCharacteristics } from './ProductCharacteristics';
import { MatchBadge } from './MatchBadge';
import { WishlistButton } from '@/features/wishlist/components/WishlistButton';
import { StickyAddToCart } from './StickyAddToCart';
import { ProductTrustBadges } from './ProductTrustBadges';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice, formatPriceWithDiscount } from '@/lib/utils/formatters';
import { ShoppingCart, GitCompare } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

interface ProductDetailsProps {
  product: Product;
  brand?: Brand;
  matchPercentage?: number;
  showWishlist?: boolean;
}

export function ProductDetails({
  product,
  brand,
  matchPercentage,
  showWishlist = false,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const hasDiscount =
    product.original_price_pyg &&
    product.original_price_pyg > product.price_pyg;

  const handleAddToCart = () => {
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
    ? formatPriceWithDiscount(product.original_price_pyg!, product.price_pyg)
    : null;

  const images = (product.images as string[] | null) || [];
  const mainAccords = product.main_accords as
    | Record<string, number>
    | null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Galería */}
      <div>
        <ProductGallery
          mainImage={product.main_image_url}
          images={images}
          productName={product.name}
        />
      </div>

      {/* Información */}
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          {' / '}
          <Link href="/perfumes" className="hover:text-foreground">
            Perfumes
          </Link>
          {brand && (
            <>
              {' / '}
              <Link
                href={`/marcas/${brand.slug}`}
                className="hover:text-foreground"
              >
                {brand.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Nombre y marca */}
        <div>
          {brand && (
            <Link
              href={`/marcas/${brand.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {brand.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold mt-1 mb-2">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.size_ml}ml · {product.concentration}
          </p>
        </div>

        {/* Match badge */}
        {matchPercentage !== undefined && (
          <div>
            <MatchBadge percentage={matchPercentage} size="lg" />
          </div>
        )}

        {/* Precio */}
        <div>
          {hasDiscount && priceInfo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {priceInfo.discounted}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {priceInfo.original}
                </span>
                <Badge variant="destructive" className="text-sm">
                  -{priceInfo.discountPercentage}%
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price_pyg)}
            </p>
          )}
        </div>

        {/* Stock */}
        {product.stock > 0 ? (
          <div className="space-y-1">
            {product.stock < 5 ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-500 text-white font-semibold">
                  ⚠️ Solo quedan {product.stock} unidades
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-green-600">En stock ({product.stock} unidades)</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-destructive">Agotado</p>
        )}

        <Separator />

        {/* Descripción corta */}
        {product.description_short && (
          <div>
            <p className="text-sm text-muted-foreground">
              {product.description_short}
            </p>
          </div>
        )}

        {/* Acordes principales */}
        {mainAccords && Object.keys(mainAccords).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Acordes Principales</h3>
            <div className="space-y-3">
              {Object.entries(mainAccords)
                .sort(([, a], [, b]) => b - a)
                .map(([accord, percentage], index) => {
                  // Colores pasteles diferentes para cada barra
                  const pastelColors = [
                    'bg-pink-300',
                    'bg-blue-300',
                    'bg-purple-300',
                    'bg-green-300',
                    'bg-yellow-300',
                    'bg-orange-300',
                    'bg-cyan-300',
                    'bg-indigo-300',
                  ];
                  const bgColors = [
                    'bg-pink-100',
                    'bg-blue-100',
                    'bg-purple-100',
                    'bg-green-100',
                    'bg-yellow-100',
                    'bg-orange-100',
                    'bg-cyan-100',
                    'bg-indigo-100',
                  ];
                  const colorIndex = index % pastelColors.length;
                  const barColor = pastelColors[colorIndex];
                  const bgColor = bgColors[colorIndex];

                  return (
                    <div key={accord}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{accord}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {percentage}%
                        </span>
                      </div>
                      <div className={`h-4 ${bgColor} rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${barColor} transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Características y Botones */}
        <div className="space-y-4">
          <ProductCharacteristics product={product} />
          
          {/* Trust Badges */}
          <ProductTrustBadges />
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 font-semibold"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Añadir al Carrito
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex-1"
            >
              <Link href={`/comparar?product=${product.id}`}>
                <GitCompare className="h-5 w-5 mr-2" />
                Comparar
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Sticky Add to Cart (Mobile) */}
        <StickyAddToCart product={product} onAddToCart={handleAddToCart} />
      </div>

      {/* Notas olfativas */}
      <div className="lg:col-span-2">
        <OlfactoryNotes product={product} />
      </div>

      {/* Descripción larga */}
      {product.description_long && (
        <div className="lg:col-span-2">
          <Separator className="mb-6" />
          <div>
            <h2 className="text-xl font-semibold mb-4">Descripción</h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description_long }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

