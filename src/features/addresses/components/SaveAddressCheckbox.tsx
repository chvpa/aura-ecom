'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CheckoutFormData } from '@/lib/validations/checkout';

interface SaveAddressCheckboxProps {
  onSaveChange: (shouldSave: boolean, label?: string) => void;
}

export function SaveAddressCheckbox({ onSaveChange }: SaveAddressCheckboxProps) {
  const form = useFormContext<CheckoutFormData>();
  const [shouldSave, setShouldSave] = useState(false);
  const [label, setLabel] = useState('Casa');

  const handleCheckboxChange = (checked: boolean) => {
    setShouldSave(checked);
    onSaveChange(checked, checked ? label : undefined);
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (shouldSave) {
      onSaveChange(true, newLabel);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="save-address"
          checked={shouldSave}
          onCheckedChange={handleCheckboxChange}
        />
        <Label
          htmlFor="save-address"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Guardar esta dirección para futuras compras
        </Label>
      </div>
      {shouldSave && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="address-label" className="text-xs text-muted-foreground">
            Etiqueta (ej: Casa, Trabajo, Oficina)
          </Label>
          <Input
            id="address-label"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Casa"
            maxLength={50}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}

