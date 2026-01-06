'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface OccasionsStepProps {
  occasions: string[];
  onOccasionsChange: (occasions: string[]) => void;
}

const occasionOptions = [
  { id: 'Casual', label: 'Casual', icon: '👕' },
  { id: 'Formal', label: 'Formal', icon: '👔' },
  { id: 'Nocturno', label: 'Nocturno', icon: '🌙' },
  { id: 'Deportivo', label: 'Deportivo', icon: '🏃' },
  { id: 'Romántico', label: 'Romántico', icon: '💕' },
  { id: 'Profesional', label: 'Profesional', icon: '💼' },
];

export function OccasionsStep({ occasions, onOccasionsChange }: OccasionsStepProps) {
  const handleToggle = (occasionId: string) => {
    if (occasions.includes(occasionId)) {
      onOccasionsChange(occasions.filter((id) => id !== occasionId));
    } else {
      onOccasionsChange([...occasions, occasionId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">¿Para qué ocasiones buscas perfumes?</h2>
        <p className="text-muted-foreground">
          Selecciona todas las ocasiones en las que te gustaría usar perfumes
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {occasionOptions.map((option) => {
          const isSelected = occasions.includes(option.id);
          return (
            <Card
              key={option.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => handleToggle(option.id)}
            >
              <div className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(option.id)}
                  id={option.id}
                />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </Label>
              </div>
            </Card>
          );
        })}
      </div>

      {occasions.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {occasions.length} ocasión{occasions.length > 1 ? 'es' : ''} seleccionada
          {occasions.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

