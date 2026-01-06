export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
}

