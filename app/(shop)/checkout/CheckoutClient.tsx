'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/useCart';
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm';
import { OrderSummary } from '@/features/checkout/components/OrderSummary';
import { TrustBadges } from '@/components/checkout/TrustBadges';
import { Card } from '@/components/ui/card';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';

export function CheckoutClient() {
  const router = useRouter();
  const { items } = useCart();
  const [selectedDepartment, setSelectedDepartment] = useState<ParaguayDepartment | undefined>();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // Usar ref para evitar redirección cuando se completa el checkout
  const hadItemsRef = useRef(items.length > 0);

  // Redirigir si carrito vacío solo si nunca tuvo items
  useEffect(() => {
    // Actualizar ref cuando hay items
    if (items.length > 0) {
      hadItemsRef.current = true;
      return;
    }
    // Solo redirigir si el carrito estaba vacío desde el inicio
    if (items.length === 0 && !hadItemsRef.current) {
      const rafId = requestAnimationFrame(() => {
        setShouldRedirect(true);
      });
      router.push('/carrito');
      return () => cancelAnimationFrame(rafId);
    }
  }, [items.length, router]);

  // Si el carrito está vacío y nunca tuvo items, redirigir
  if (shouldRedirect) {
    return null; // Redirigiendo...
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trust Badges */}
      <TrustBadges />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Formulario de checkout */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Datos de Envío y Pago</h1>
            <CheckoutForm onDepartmentChange={setSelectedDepartment} />
          </Card>
        </div>

        {/* Resumen de orden */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <OrderSummary shippingDepartment={selectedDepartment} />
          </Card>
        </div>
      </div>
    </div>
  );
}

