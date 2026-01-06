'use client';

import { Shield, Truck, Award, Lock } from 'lucide-react';

const badges = [
  {
    icon: Lock,
    text: 'Pago 100% Seguro',
  },
  {
    icon: Truck,
    text: 'Envío a todo Paraguay',
  },
  {
    icon: Award,
    text: 'Garantía de Autenticidad',
  },
  {
    icon: Shield,
    text: 'Devolución Garantizada',
  },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-4 border-t border-b bg-muted/30">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span>{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

