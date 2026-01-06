'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { PARAGUAY_DEPARTMENTS, PARAGUAY_CITIES } from '@/lib/constants/paraguay';
import type { CheckoutFormData } from '@/lib/validations/checkout';

export function ShippingForm() {
  const form = useFormContext<CheckoutFormData>();
  const selectedDepartment = form.watch('shipping.department');

  const availableCities = selectedDepartment
    ? PARAGUAY_CITIES[selectedDepartment as keyof typeof PARAGUAY_CITIES] || []
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos de envío</h3>

      <FormField
        control={form.control}
        name="shipping.full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo *</FormLabel>
            <FormControl>
              <Input placeholder="María González" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shipping.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono *</FormLabel>
            <FormControl>
              <Input
                placeholder="0981234567"
                {...field}
                onChange={(e) => {
                  // Solo permitir números
                  const value = e.target.value.replace(/\D/g, '');
                  field.onChange(value);
                }}
                maxLength={10}
              />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-muted-foreground">
              Formato: 0981234567 (10 dígitos)
            </p>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="shipping.department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento *</FormLabel>
              <FormControl>
                <Combobox
                  options={PARAGUAY_DEPARTMENTS.map((dept) => ({
                    value: dept,
                    label: dept,
                  }))}
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Resetear ciudad cuando cambia departamento
                    form.setValue('shipping.city', '');
                  }}
                  placeholder="Selecciona un departamento"
                  searchPlaceholder="Buscar departamento..."
                  emptyText="No se encontraron departamentos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad *</FormLabel>
              <FormControl>
                <Combobox
                  options={availableCities.map((city) => ({
                    value: city,
                    label: city,
                  }))}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  placeholder={
                    !selectedDepartment
                      ? 'Selecciona primero un departamento'
                      : 'Selecciona o escribe una ciudad'
                  }
                  searchPlaceholder="Buscar ciudad..."
                  emptyText="No se encontraron ciudades"
                  disabled={!selectedDepartment || availableCities.length === 0}
                  allowCustom={true}
                  onCustomValue={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="shipping.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección *</FormLabel>
            <FormControl>
              <Input placeholder="Av. España 123" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shipping.reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referencia (opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Cerca del supermercado, entre calles..."
                {...field}
                rows={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

