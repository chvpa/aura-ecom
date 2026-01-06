'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface LogoUploadProps {
  logoUrl: string | null | undefined;
  onChange: (logoUrl: string | null) => void;
  className?: string;
}

export function LogoUpload({
  logoUrl,
  onChange,
  className,
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/admin/brands/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir logo');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(error instanceof Error ? error.message : 'Error al subir logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeLogo = () => {
    onChange(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
              <Image
                src={logoUrl}
                alt="Logo de marca"
                fill
                className="object-contain p-2"
                sizes="128px"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={removeLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <div className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </label>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Formatos: JPG, PNG, WEBP, SVG. Máx 2MB. Tamaño recomendado: 200x200px o superior.
      </p>
    </div>
  );
}

