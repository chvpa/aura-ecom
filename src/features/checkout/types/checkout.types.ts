export type PaymentMethod = 'transferencia' | 'giro' | 'tarjeta';

export interface OrderCreateRequest {
  shipping_address: {
    full_name: string;
    phone: string;
    department: string;
    city: string;
    street: string;
    reference?: string;
  };
  payment_method: PaymentMethod;
  notes?: string;
}

export interface ShippingCostResponse {
  cost: number;
  isFree: boolean;
}

