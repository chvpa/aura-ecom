'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ORDER_STATUS_CONFIG } from '@/features/orders/constants/orderStatuses';
import type { OrderStatus } from '@/features/orders/types/order.types';

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus?: string;
  currentTracking?: string | null;
  onUpdate?: () => void;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentPaymentStatus = 'pending',
  currentTracking,
  onUpdate,
}: OrderStatusUpdateProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState<string>(currentPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || '');
  const [loading, setLoading] = useState(false);

  // Sincronizar estado local cuando cambien los props
  useEffect(() => {
    setStatus(currentStatus);
    setPaymentStatus(currentPaymentStatus);
    setTrackingNumber(currentTracking || '');
  }, [currentStatus, currentPaymentStatus, currentTracking]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber: trackingNumber || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar');
      }

      const data = await response.json();
      
      // Actualizar estado local con los datos devueltos
      if (data.order) {
        setStatus(data.order.status as OrderStatus);
        setPaymentStatus(data.order.payment_status || 'pending');
        setTrackingNumber(data.order.tracking_number || '');
      }

      toast.success('Pedido actualizado correctamente');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar pedido'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Actualizar Estado</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado del Pedido</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Estado de Pago</Label>
          <Select 
            value={paymentStatus} 
            onValueChange={(value) => setPaymentStatus(value)}
          >
            <SelectTrigger id="paymentStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tracking">Número de Tracking</Label>
          <Input
            id="tracking"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Ej: ABC123456789"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );
}

