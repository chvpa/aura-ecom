'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@/lib/utils/formatters';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  className,
}: KPICardProps) {
  const formattedValue =
    typeof value === 'number' && title.toLowerCase().includes('venta')
      ? formatPrice(value)
      : typeof value === 'number'
      ? value.toLocaleString('es-PY')
      : value;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && changeLabel && (
          <p
            className={cn(
              'text-xs mt-1',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change >= 0 ? '+' : ''}
            {change}% {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

