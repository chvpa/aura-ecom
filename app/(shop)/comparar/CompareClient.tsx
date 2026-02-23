'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus, Search, ShoppingCart, GitCompare } from 'lucide-react';
import { formatPrice, formatPriceWithDiscount } from '@/lib/utils/formatters';
import { useCart } from '@/features/cart/hooks/useCart';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

const MAX_COMPARE = 4;

export function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load products from URL params
  useEffect(() => {
    const loadProducts = async () => {
      const productIds = searchParams.get('products')?.split(',').filter(Boolean) || [];
      const singleProduct = searchParams.get('product');
      
      if (singleProduct && !productIds.includes(singleProduct)) {
        productIds.push(singleProduct);
      }

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products?ids=${productIds.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          // Filter out already selected products
          const filtered = (data.products || []).filter(
            (p: Product) => !products.find((existing) => existing.id === p.id)
          );
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, products]);

  const addProduct = (product: Product) => {
    if (products.length >= MAX_COMPARE) {
      toast.error(`Máximo ${MAX_COMPARE} productos para comparar`);
      return;
    }

    const newProducts = [...products, product];
    setProducts(newProducts);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);

    // Update URL
    const ids = newProducts.map((p) => p.id).join(',');
    router.push(`/comparar?products=${ids}`, { scroll: false });
  };

  const removeProduct = (productId: string) => {
    const newProducts = products.filter((p) => p.id !== productId);
    setProducts(newProducts);

    // Update URL
    if (newProducts.length > 0) {
      const ids = newProducts.map((p) => p.id).join(',');
      router.push(`/comparar?products=${ids}`, { scroll: false });
    } else {
      router.push('/comparar', { scroll: false });
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price_pyg,
      name: product.name,
      image: product.main_image_url || '/placeholder-product.jpg',
      slug: product.slug,
      stock: product.stock,
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-4">
              <div className="aspect-square bg-muted rounded-lg" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const hasDiscount = product.original_price_pyg && product.original_price_pyg > product.price_pyg;
          const priceInfo = hasDiscount
            ? formatPriceWithDiscount(product.original_price_pyg!, product.price_pyg)
            : null;

          return (
            <Card key={product.id} className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeProduct(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="p-4">
                <Link href={`/perfumes/${product.slug}`}>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={product.main_image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {hasDiscount && priceInfo && (
                      <Badge variant="destructive" className="absolute top-2 left-2">
                        -{priceInfo.discountPercentage}%
                      </Badge>
                    )}
                  </div>
                </Link>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div>
                  <Link href={`/perfumes/${product.slug}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {product.size_ml}ml · {product.concentration}
                  </p>
                </div>

                {/* Price */}
                <div>
                  {hasDiscount && priceInfo ? (
                    <div>
                      <span className="text-sm text-red-800/70 line-through block">
                        {priceInfo.original}
                      </span>
                      <span className="text-lg font-bold text-black">
                        {priceInfo.discounted}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-black">
                      {formatPrice(product.price_pyg)}
                    </span>
                  )}
                </div>

                {/* Characteristics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Género</span>
                    <span className="font-medium">{product.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concentración</span>
                    <span className="font-medium">{product.concentration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longevidad</span>
                    <span className="font-medium">{product.longevity_hours ? `${product.longevity_hours}h` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estela</span>
                    <span className="font-medium">{product.sillage_category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock</span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                    </span>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Añadir al Carrito
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Product Slot */}
        {products.length < MAX_COMPARE && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] p-4">
              {showSearch ? (
                <div className="w-full space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar perfume..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>

                  {isSearching && (
                    <p className="text-sm text-muted-foreground text-center">Buscando...</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                          onClick={() => addProduct(product)}
                        >
                          <div className="relative h-12 w-12 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                            <Image
                              src={product.main_image_url || '/placeholder-product.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(product.price_pyg)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-center mb-4">
                    Añade un perfume para comparar
                  </p>
                  <Button variant="outline" onClick={() => setShowSearch(true)}>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Añadir Perfume
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 && !showSearch && (
        <div className="text-center py-12">
          <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Comienza a comparar</h2>
          <p className="text-muted-foreground mb-6">
            Selecciona perfumes desde el catálogo o búscalos aquí para compararlos
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/perfumes">Ver Catálogo</Link>
            </Button>
            <Button variant="outline" onClick={() => setShowSearch(true)}>
              Buscar Perfume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

