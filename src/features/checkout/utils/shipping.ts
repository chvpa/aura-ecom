import type { CartItem } from '@/features/cart/types/cart.types';
import { SHIPPING_COSTS, FREE_SHIPPING_MIN_ITEMS } from '@/lib/constants/paraguay';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';

/**
 * Calcula el costo de envío basado en items y departamento
 * Esta función puede ser usada tanto en cliente como servidor
 */
export function calculateShippingCost(
  items: CartItem[],
  department: ParaguayDepartment
): number {
  // Envío gratis si tiene 3 o más items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems >= FREE_SHIPPING_MIN_ITEMS) {
    return 0;
  }

  // Costo según departamento
  return SHIPPING_COSTS[department] || 50000;
}

