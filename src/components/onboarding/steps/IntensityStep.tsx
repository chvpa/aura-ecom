'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface IntensityStepProps {
  intensity: string;
  onIntensityChange: (intensity: string) => void;
}

const intensityOptions = [
  { value: 'Baja', label: 'Baja', description: 'Fragancias sutiles y discretas' },
  { value: 'Moderada', label: 'Moderada', description: 'Equilibrio perfecto' },
  { value: 'Alta', label: 'Alta', description: 'Fragancias intensas y duraderas' },
];

export function IntensityStep({ intensity, onIntensityChange }: IntensityStepProps) {
  const getIntensityIndex = (value: string) => {
    return intensityOptions.findIndex((opt) => opt.value === value);
  };

  const handleSliderChange = (values: number[]) => {
    const index = values[0] - 1; // Slider es 1-3, array es 0-2
    onIntensityChange(intensityOptions[index].value);
  };

  const currentIndex = getIntensityIndex(intensity);
  const sliderValue = currentIndex >= 0 ? currentIndex + 1 : 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">¿Qué intensidad prefieres?</h2>
        <p className="text-muted-foreground">
          Selecciona qué tan intensa te gusta que sea tu fragancia
        </p>
      </div>

      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            min={1}
            max={3}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {intensityOptions.map((option, index) => {
            const isSelected = intensity === option.value;
            return (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onIntensityChange(option.value)}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold mb-2 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Label className="font-semibold">{option.label}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {intensity && (
          <div className="text-center pt-4">
            <p className="text-sm font-medium">
              Seleccionado: <span className="text-primary">{intensity}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

