'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Instagram,
  Sun,
  Moon,
  Calendar,
  Briefcase,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils/cn';
import { DeliveryBanner } from './DeliveryBanner';

// Lazy load CartDrawer para mejorar performance inicial
const CartDrawer = dynamic(
  () => import('@/features/cart/components/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
);

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Usar requestAnimationFrame para evitar setState síncrono en efecto
    const rafId = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  const isActiveLink = (href: string) => {
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      const params = new URLSearchParams(query);
      
      // Verificar si la ruta base coincide
      if (pathname === path || pathname.startsWith(path + '/')) {
        // Verificar si los parámetros coinciden
        for (const [key, value] of params.entries()) {
          if (searchParams.get(key) === value) {
            return true;
          }
        }
      }
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <DeliveryBanner />

      {/* Barra principal - Logo, Buscador, Iconos */}
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col">
          {/* Fila única: Logo, Navegación e Iconos */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl font-bold">ODORA</span>
            </Link>

            {/* Navegación - Desktop */}
            {isMounted ? (
            <NavigationMenu className="flex-1 justify-center">
              <NavigationMenuList className="flex-wrap gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Perfumes</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes"
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none transition-all duration-200 select-none focus:shadow-md hover:bg-accent"
                          >
                            <Sparkles className="mb-2 h-6 w-6 text-primary" />
                            <div className="mb-2 text-lg font-medium">
                              Todos los Perfumes
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Explora nuestra colección completa de fragancias exclusivas.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?genero=Hombre"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><User className="h-4 w-4" /></span>
                              Para Hombre
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Fragancias masculinas con notas amaderadas y especiadas.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?genero=Mujer"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Heart className="h-4 w-4" /></span>
                              Para Mujer
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Perfumes femeninos con notas florales y dulces.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?genero=Unisex"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><User className="h-4 w-4" /></span>
                              Unisex
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Fragancias versátiles para todos los gustos.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Ocasiones</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Diurno"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Sun className="h-4 w-4" /></span>
                              Día
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Fragancias frescas y ligeras para el día.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Nocturno"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Moon className="h-4 w-4" /></span>
                              Noche
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Perfumes intensos y seductores para la noche.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Casual"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Calendar className="h-4 w-4" /></span>
                              Casual
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Perfectos para el uso diario y relajado.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Formal"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Briefcase className="h-4 w-4" /></span>
                              Formal
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Elegancia y sofisticación para ocasiones especiales.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Romántico"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Heart className="h-4 w-4" /></span>
                              Romántico
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Fragancias dulces y románticas.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/perfumes?ocasion=Deportivo"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm leading-none font-medium">
                              <span className="text-primary"><Activity className="h-4 w-4" /></span>
                              Deportivo
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Perfumes frescos y energéticos.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/marcas">Marcas</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/comparar" className="flex items-center gap-2">
                      Comparador
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">
                        Próximamente
                      </span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            ) : (
              <div className="flex-1 justify-center flex items-center">
                <nav className="flex items-center gap-1">
                  <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
                </nav>
              </div>
            )}

            {/* Iconos - Desktop */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Carrito"
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isMounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Button>
              </CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="relative"
                onClick={() => router.push('/cuenta/wishlist')}
              >
                <Heart className="h-5 w-5" />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mi cuenta"
                onClick={() =>
                  router.push(isAuthenticated ? '/cuenta/perfil' : '/login')
                }
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden">
          {/* Primera fila: Hamburger, Logo, Carrito y Perfil */}
          <div className="flex h-14 items-center gap-2 relative">
            {/* Menú hamburger */}
            {isMounted ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menú" className="flex-shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white">
                <SheetHeader className="sr-only">
                  <SheetTitle className="sr-only">Menú</SheetTitle>
                </SheetHeader>
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-2xl font-bold">ODORA</span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Links de navegación */}
                  <nav className="space-y-1">
                    <Link
                      href="/perfumes?genero=Hombre"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        isActiveLink('/perfumes?genero=Hombre')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Para Hombre
                    </Link>
                    <Link
                      href="/perfumes?genero=Mujer"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        isActiveLink('/perfumes?genero=Mujer')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Para Mujer
                    </Link>
                    <Link
                      href="/perfumes?genero=Unisex"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        isActiveLink('/perfumes?genero=Unisex')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Unisex
                    </Link>
                    <Link
                      href="/perfumes?ocasion=Diurno"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        isActiveLink('/perfumes?ocasion=Diurno')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Día
                    </Link>
                    <Link
                      href="/perfumes?ocasion=Nocturno"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        isActiveLink('/perfumes?ocasion=Nocturno')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Noche
                    </Link>
                    <Link
                      href="/perfumes?temporada=Otoño/Invierno"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        searchParams.get('temporada') === 'Otoño/Invierno'
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Otoño/Invierno
                    </Link>
                      <Link
                      href="/perfumes?temporada=Primavera/Verano"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        searchParams.get('temporada') === 'Primavera/Verano'
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Primavera/Verano
                      </Link>
                    <Link
                      href="/marcas"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        pathname === '/marcas' || pathname.startsWith('/marcas/')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      Marcas
                    </Link>
                    <Link
                      href="/comparar"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-neutral-900',
                        pathname === '/comparar' || pathname.startsWith('/comparar/')
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      <span>Comparador</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">
                        Próximamente
                      </span>
                    </Link>
                  </nav>

                  {/* Redes sociales */}
                  <div className="pt-4 border-t">
                    <div className="space-y-3 px-3">
                      <p className="text-sm font-medium text-neutral-700">Seguinos en</p>
                      <div className="flex items-center gap-4">
                        <a
                          href="https://instagram.com/odoraperfumes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-600 hover:text-primary transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-6 w-6" />
                        </a>
                        <a
                          href="https://tiktok.com/@odoraperfumes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-600 hover:text-primary transition-colors"
                          aria-label="TikTok"
                        >
                          <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Menú" className="flex-shrink-0" disabled>
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo - Centrado absolutamente */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2">
              <span className="text-xl font-bold">ODORA</span>
            </Link>

            {/* Carrito y Perfil */}
            <div className="flex items-center gap-1 ml-auto">
              <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Carrito"
                  className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                  {isMounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
              </Button>
              </CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mi cuenta"
                onClick={() =>
                  router.push(isAuthenticated ? '/cuenta/perfil' : '/login')
                }
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
