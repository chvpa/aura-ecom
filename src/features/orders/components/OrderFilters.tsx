'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORDER_STATUS_CONFIG } from '../constants/orderStatuses';
import type { OrderStatus } from '../types/order.types';

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos los pedidos' },
  ...Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
];

interface OrderFiltersProps {
  className?: string;
}

export function OrderFilters({ className }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('status') || 'all';

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    router.push(`/cuenta/pedidos?${params.toString()}`);
  };

  return (
    <div className={className}>
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

