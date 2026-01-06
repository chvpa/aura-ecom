'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { Database } from '@/types/database.types';

type OlfactoryFamily = Database['public']['Tables']['olfactory_families']['Row'];

interface OlfactoryFamilyCardProps {
  family: OlfactoryFamily;
  isSelected: boolean;
  onSelect: () => void;
}

export function OlfactoryFamilyCard({
  family,
  isSelected,
  onSelect,
}: OlfactoryFamilyCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {family.icon && (
            <div className="text-2xl" style={{ color: family.color }}>
              {family.icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{family.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{family.description}</p>
          </div>
          {isSelected && (
            <div className="flex-shrink-0">
              <div
                className="h-5 w-5 rounded-full border-2 border-primary bg-primary"
                style={{ backgroundColor: family.color }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

