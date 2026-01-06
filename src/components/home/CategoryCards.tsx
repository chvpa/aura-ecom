'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Para Hombre',
    href: '/perfumes?genero=Hombre',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
    description: 'Fragancias masculinas',
  },
  {
    name: 'Para Mujer',
    href: '/perfumes?genero=Mujer',
    image: 'https://images.unsplash.com/photo-1595425970377-c9706c919f9a?w=400',
    description: 'Perfumes femeninos',
  },
  {
    name: 'Unisex',
    href: '/perfumes?genero=Unisex',
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400',
    description: 'Para todos los gustos',
  },
];

export function CategoryCards() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Explora por Categoría</h2>
        <p className="text-muted-foreground">
          Encuentra tu fragancia perfecta
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.href} href={category.href}>
            <Card className="group overflow-hidden h-full hover:shadow-lg transition-all cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Explorar</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

