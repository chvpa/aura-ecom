import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface OlfactoryNotesProps {
  product: Product;
}

export function OlfactoryNotes({ product }: OlfactoryNotesProps) {
  const notes = product.notes as
    | {
        top?: string[];
        heart?: string[];
        base?: string[];
      }
    | null;

  if (!notes || (!notes.top && !notes.heart && !notes.base)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas Olfativas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notes.top && notes.top.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-primary">
              Notas de Salida
            </h4>
            <div className="flex flex-wrap gap-2">
              {notes.top.map((note, index) => (
                <Badge key={index} variant="outline">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {notes.heart && notes.heart.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-primary">
              Notas de Corazón
            </h4>
            <div className="flex flex-wrap gap-2">
              {notes.heart.map((note, index) => (
                <Badge key={index} variant="outline">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {notes.base && notes.base.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-primary">
              Notas de Fondo
            </h4>
            <div className="flex flex-wrap gap-2">
              {notes.base.map((note, index) => (
                <Badge key={index} variant="outline">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

