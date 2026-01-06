'use client';

import { ORDER_STATUS_SEQUENCE, getOrderStatusConfig, ORDER_STATUS_ICONS } from '../constants/orderStatuses';
import type { OrderStatus, OrderTimelineStep } from '../types/order.types';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2 } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

export function OrderTimeline({ currentStatus, className }: OrderTimelineProps) {
  // Si está cancelado, no mostrar timeline
  if (currentStatus === 'cancelled') {
    return null;
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  
  // Si el estado no está en la secuencia, usar el primer estado
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  
  const steps: OrderTimelineStep[] = ORDER_STATUS_SEQUENCE.map((status, index) => ({
    status,
    label: getOrderStatusConfig(status).label,
    completed: index < effectiveIndex,
    current: index === effectiveIndex,
  }));

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-foreground">Estado del Pedido</h3>
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {steps.map((step, index) => {
            const config = getOrderStatusConfig(step.status);
            const Icon = ORDER_STATUS_ICONS[config.icon as keyof typeof ORDER_STATUS_ICONS];
            
            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Icono */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                    step.completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step.current
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    Icon && <Icon className="h-4 w-4" />
                  )}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.completed || step.current
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.current && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Estado actual
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

