import { Metadata } from 'next';
import { GitCompare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Comparador de Perfumes | Odora Perfumes',
  description: 'Compara hasta 4 perfumes lado a lado. Analiza características, precios y notas olfativas para encontrar tu fragancia ideal.',
};

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <GitCompare className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Comparador de Perfumes</h1>
          <p className="text-lg text-muted-foreground">
            Estamos trabajando en esta funcionalidad para que puedas comparar perfumes lado a lado.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Próximamente</span>
          </div>
        </div>
        <div className="pt-6">
          <Button asChild>
            <Link href="/perfumes">Explorar Perfumes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

