'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface ClimateStepProps {
  climates: string[];
  onClimatesChange: (climates: string[]) => void;
}

const climateOptions = [
  { id: 'Caluroso', label: 'Caluroso', icon: '☀️', description: 'Climas cálidos y soleados' },
  { id: 'Templado', label: 'Templado', icon: '☁️', description: 'Temperaturas moderadas' },
  { id: 'Frío', label: 'Frío', icon: '❄️', description: 'Climas fríos y frescos' },
];

export function ClimateStep({ climates, onClimatesChange }: ClimateStepProps) {
  const handleToggle = (climateId: string) => {
    if (climates.includes(climateId)) {
      onClimatesChange(climates.filter((id) => id !== climateId));
    } else {
      onClimatesChange([...climates, climateId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">¿Qué climas prefieres?</h2>
        <p className="text-muted-foreground">
          Selecciona los climas en los que más te gusta usar perfumes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {climateOptions.map((option) => {
          const isSelected = climates.includes(option.id);
          return (
            <Card
              key={option.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => handleToggle(option.id)}
            >
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">{option.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                {isSelected && (
                  <div className="mt-4">
                    <div className="inline-block h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {climates.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {climates.length} clima{climates.length > 1 ? 's' : ''} seleccionado
          {climates.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

