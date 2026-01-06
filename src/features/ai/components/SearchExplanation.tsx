'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchExplanationProps {
  explanation: string;
  className?: string;
}

export function SearchExplanation({
  explanation,
  className,
}: SearchExplanationProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-semibold text-purple-900">
            Recomendación de IA
          </h3>
          <p className="text-sm leading-relaxed text-purple-800">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

