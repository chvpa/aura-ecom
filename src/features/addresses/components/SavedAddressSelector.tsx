'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import type { CheckoutFormData } from '@/lib/validations/checkout';
import type { SavedAddress } from '../services/addressServiceClient';
import { savedAddressToShippingAddress } from '../services/addressServiceClient';

interface SavedAddressSelectorProps {
  savedAddresses: SavedAddress[];
  onSelectAddress: (address: SavedAddress) => void;
  onNewAddress: () => void;
}

export function SavedAddressSelector({
  savedAddresses,
  onSelectAddress,
  onNewAddress,
}: SavedAddressSelectorProps) {
  const form = useFormContext<CheckoutFormData>();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const handleAddressSelect = useCallback((addressId: string) => {
    if (addressId === 'new') {
      onNewAddress();
      setSelectedAddressId('');
      return;
    }

    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      const shippingAddress = savedAddressToShippingAddress(address);
      form.setValue('shipping', shippingAddress);
      onSelectAddress(address);
    }
  }, [savedAddresses, form, onNewAddress, onSelectAddress]);

  // Cargar dirección por defecto si existe
  useEffect(() => {
    const defaultAddress = savedAddresses.find((addr) => addr.is_default);
    if (defaultAddress && !selectedAddressId) {
      // Usar setTimeout para evitar setState sincrónico en efecto
      setTimeout(() => {
        handleAddressSelect(defaultAddress.id);
      }, 0);
    }
  }, [savedAddresses, selectedAddressId, handleAddressSelect]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Dirección de envío</label>
        {savedAddresses.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewAddress}
            className="h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Nueva dirección
          </Button>
        )}
      </div>

      {savedAddresses.length > 0 ? (
        <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una dirección guardada" />
          </SelectTrigger>
          <SelectContent>
            {savedAddresses.map((address) => (
              <SelectItem key={address.id} value={address.id}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {address.label}
                      {address.is_default && (
                        <span className="ml-2 text-xs text-primary">(Por defecto)</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {address.street}, {address.city}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Agregar nueva dirección</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="text-sm text-muted-foreground">
          No tienes direcciones guardadas. Completa el formulario para crear una.
        </div>
      )}
    </div>
  );
}

