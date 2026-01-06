'use client';

import { Badge } from '@/components/ui/badge';
import { getOrderStatusConfig, ORDER_STATUS_ICONS } from '../constants/orderStatuses';
import type { OrderStatus } from '../types/order.types';
import { cn } from '@/lib/utils/cn';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = getOrderStatusConfig(status);
  const Icon = ORDER_STATUS_ICONS[config.icon as keyof typeof ORDER_STATUS_ICONS];

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 border-0',
        config.color,
        config.bgColor,
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
}

