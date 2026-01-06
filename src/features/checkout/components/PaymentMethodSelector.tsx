'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet, Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { CheckoutFormData } from '@/lib/validations/checkout';

const paymentMethods = [
  {
    value: 'transferencia',
    label: 'Transferencia Bancaria',
    icon: CreditCard,
    description: 'Transferencia directa a nuestra cuenta bancaria',
  },
  {
    value: 'giro',
    label: 'Giro',
    icon: Wallet,
    description: 'Giro postal o bancario',
  },
  {
    value: 'tarjeta',
    label: 'Tarjeta de Crédito/Débito',
    icon: Receipt,
    description: 'Pago con tarjeta (próximamente)',
  },
] as const;

export function PaymentMethodSelector() {
  const form = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Método de pago</h3>

      <FormField
        control={form.control}
        name="payment_method"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.value}>
                      <RadioGroupItem
                        value={method.value}
                        id={method.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.value}
                        className="flex items-start gap-3 rounded-lg border-2 border-muted p-4 cursor-pointer transition-colors hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <Icon className="h-5 w-5 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

