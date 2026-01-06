'use client';

import type { ParsedContext } from '@/lib/services/aiSearch';
import { cn } from '@/lib/utils/cn';

interface SearchContextBadgesProps {
  context: ParsedContext;
  className?: string;
}

export function SearchContextBadges({
  context,
  className,
}: SearchContextBadgesProps) {
  const badges: Array<{ label: string; value: string | null }> = [];

  if (context.gender) {
    badges.push({ label: 'Género', value: context.gender });
  }

  if (context.occasion) {
    badges.push({ label: 'Ocasión', value: context.occasion });
  }

  if (context.intensity) {
    badges.push({ label: 'Intensidad', value: context.intensity });
  }

  if (context.climate) {
    badges.push({ label: 'Clima', value: context.climate });
  }

  if (context.event) {
    badges.push({ label: 'Evento', value: context.event });
  }

  if (context.families && context.families.length > 0) {
    badges.push({
      label: 'Familias',
      value: context.families.join(', '),
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700"
        >
          <span className="font-medium">{badge.label}:</span>
          <span>{badge.value}</span>
        </div>
      ))}
    </div>
  );
}

