'use client';

import { Shield, Truck, Award } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    text: '100% Original',
  },
  {
    icon: Truck,
    text: 'Envío Gratis desde 3 unidades',
  },
  {
    icon: Award,
    text: 'Garantía de Autenticidad',
  },
];

export function ProductTrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3 border-t border-b">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

