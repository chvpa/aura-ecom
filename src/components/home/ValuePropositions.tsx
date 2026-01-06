'use client';

import { Truck, Shield, Award, Clock } from 'lucide-react';

const propositions = [
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'A partir de 3 unidades',
  },
  {
    icon: Shield,
    title: '100% Originales',
    description: 'Garantía de autenticidad',
  },
  {
    icon: Award,
    title: 'Mejor Precio',
    description: 'En todo Paraguay',
  },
  {
    icon: Clock,
    title: 'Entrega Rápida',
    description: '2-5 días hábiles',
  },
];

export function ValuePropositions() {
  return (
    <div className="border-y bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {propositions.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{prop.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

