'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ShippingFormWithSavedAddresses } from './ShippingFormWithSavedAddresses';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/checkout';
import { useCart } from '@/features/cart/hooks/useCart';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { getSavedAddressesClient, saveAddressClient, savedAddressToShippingAddress } from '@/features/addresses/services/addressServiceClient';
import type { SavedAddress } from '@/features/addresses/services/addressServiceClient';

interface CheckoutFormProps {
  onDepartmentChange?: (department: ParaguayDepartment | undefined) => void;
}

export function CheckoutForm({ onDepartmentChange }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState<string>('Casa');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        full_name: '',
        phone: '',
        department: undefined as ParaguayDepartment | undefined, // Undefined to avoid controlled/uncontrolled issue with Select
        city: '',
        street: '',
        reference: '',
      },
      payment_method: 'transferencia',
      notes: '',
    },
  });

  // Cargar direcciones guardadas
  useEffect(() => {
    async function loadAddresses() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const addresses = await getSavedAddressesClient(user.id);
          setSavedAddresses(addresses);
          
          // Si hay una dirección por defecto, cargarla automáticamente
          const defaultAddress = addresses.find(addr => addr.is_default);
          if (defaultAddress) {
            const shippingAddress = savedAddressToShippingAddress(defaultAddress);
            // Usar setTimeout para asegurar que el form esté listo
            setTimeout(() => {
              form.setValue('shipping', shippingAddress, { shouldValidate: false });
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [form]);

  // Observar cambios en departamento para actualizar resumen
  const department = form.watch('shipping.department');
  useEffect(() => {
    if (onDepartmentChange) {
      onDepartmentChange(department as ParaguayDepartment | undefined);
    }
  }, [department, onDepartmentChange]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      router.push('/carrito');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: data,
          cartItems: items,
        }),
      });

      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 500));
        
        // Intentar extraer información del error si es HTML de Next.js
        if (text.includes('TurbopackInternalError') || text.includes('<!DOCTYPE html>')) {
          throw new Error(
            'Error interno del servidor. Por favor intenta de nuevo. Si el problema persiste, contacta al soporte.'
          );
        }
        
        throw new Error('Error del servidor. Por favor intenta de nuevo.');
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Error al procesar la respuesta del servidor.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la orden');
      }

      // Guardar dirección si el usuario lo solicitó
      if (shouldSaveAddress && addressLabel) {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Verificar si ya existe una dirección por defecto
            const hasDefaultAddress = savedAddresses.some(addr => addr.is_default);
            
            // Marcar como default si no hay ninguna dirección default, o siempre marcar como default
            // ya que el usuario está usando esta dirección en el checkout actual
            await saveAddressClient(user.id, {
              label: addressLabel,
              full_name: data.shipping.full_name,
              phone: data.shipping.phone,
              department: data.shipping.department,
              city: data.shipping.city,
              street: data.shipping.street,
              reference: data.shipping.reference,
              is_default: true, // Siempre marcar como default la dirección que se está usando
            });
          }
        } catch (saveError) {
          console.error('Error saving address:', saveError);
          // No fallar la orden si falla guardar la dirección
        }
      }

      // Limpiar carrito
      clearCart();

      // Redirigir a página de confirmación usando replace para evitar volver atrás
      router.replace(`/confirmacion/${result.order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al procesar tu orden. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAddress = (address: SavedAddress) => {
    // La dirección ya se carga automáticamente en el selector
  };

  const handleSaveAddress = (shouldSave: boolean, label?: string) => {
    setShouldSaveAddress(shouldSave);
    if (label) {
      setAddressLabel(label);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {loadingAddresses ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <ShippingFormWithSavedAddresses
            savedAddresses={savedAddresses}
            onSelectAddress={handleSelectAddress}
            onSaveAddress={handleSaveAddress}
          />
        )}

        <PaymentMethodSelector />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas adicionales (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instrucciones especiales de entrega, comentarios, etc."
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold py-6 text-lg"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Confirmar Orden
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

