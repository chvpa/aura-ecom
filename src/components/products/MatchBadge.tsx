import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { MatchTooltip } from './MatchTooltip';

interface MatchBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  reasons?: Record<string, unknown> | null;
}

export function MatchBadge({
  percentage,
  size = 'md',
  className,
  reasons,
}: MatchBadgeProps) {
  // Determinar color según porcentaje
  const getColorClass = () => {
    if (percentage >= 76) {
      return 'bg-primary text-primary-foreground';
    }
    if (percentage >= 51) {
      return 'bg-accent-300 text-accent-foreground';
    }
    return 'bg-neutral-200 text-neutral-700';
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-base px-4 py-1.5';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const badge = (
    <Badge
      className={cn(
        'font-semibold',
        getColorClass(),
        getSizeClass(),
        className
      )}
    >
      {percentage}% Match
    </Badge>
  );

  // Si hay razones, envolver con tooltip
  if (reasons) {
    return <MatchTooltip reasons={reasons}>{badge}</MatchTooltip>;
  }

  return badge;
}

