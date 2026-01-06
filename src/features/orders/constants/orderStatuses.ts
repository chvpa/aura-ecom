import type { OrderStatus, OrderStatusConfig } from '../types/order.types';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    label: 'Pendiente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'Clock',
  },
  processing: {
    label: 'Procesando',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'Package',
  },
  shipped: {
    label: 'Enviado',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'Truck',
  },
  delivered: {
    label: 'Entregado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'XCircle',
  },
};

export const ORDER_STATUS_ICONS = {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
};

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
}

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
];

