'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info } from 'lucide-react';

interface MatchTooltipProps {
  reasons?: Record<string, unknown> | null;
  children: React.ReactNode;
}

/**
 * Componente que muestra un tooltip con las razones del match
 */
export function MatchTooltip({ reasons, children }: MatchTooltipProps) {
  // Si no hay razones, no mostrar tooltip
  if (!reasons || Object.keys(reasons).length === 0) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="inline-flex items-center gap-1 cursor-help">
          {children}
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">¿Por qué este match?</h4>
          <div className="text-sm text-muted-foreground">
            {Object.entries(reasons).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="font-medium capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>{' '}
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

