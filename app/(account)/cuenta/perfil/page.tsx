'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { OlfactoryFamilyCard } from '@/components/onboarding/OlfactoryFamilyCard';
import type { Database } from '@/types/database.types';
import type { Json } from '@/types/database.types';

type OlfactoryFamily = Database['public']['Tables']['olfactory_families']['Row'];
type User = Database['public']['Tables']['users']['Row'];

export default function ProfilePage() {
  const [showRerunDialog, setShowRerunDialog] = useState(false);
  const [families, setFamilies] = useState<OlfactoryFamily[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (user) {
      // Cargar datos del usuario
      supabase
        .from('users')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading user data:', error);
            return;
          }
          if (data) {
            reset({
              fullName: (data as User).full_name || '',
              phone: (data as User).phone || '',
            });
          }
        });
    }
  }, [user, supabase, reset]);

  useEffect(() => {
    // Cargar familias olfativas para mostrar en el perfil
    supabase
      .from('olfactory_families')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) {
          setFamilies(data);
        }
      });
  }, [supabase]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    if (!user) return;

    try {
      const updatePayload: Database['public']['Tables']['users']['Update'] = {
        full_name: data.fullName ?? null,
        phone: data.phone ?? null,
      };
      const { error } = await (supabase
        .from('users') as any)
        .update(updatePayload)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleRerunOnboarding = async () => {
    if (!user) return;

    try {
      const updatePayload: Database['public']['Tables']['user_profiles']['Update'] = {
        onboarding_completed: false,
      };
      await (supabase
        .from('user_profiles') as any)
        .update(updatePayload)
        .eq('user_id', user.id);

      setShowRerunDialog(false);
      router.push('/onboarding');
    } catch (error) {
      toast.error('Error al reiniciar el onboarding');
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  interface UserPreferences {
    familias_favoritas?: string[];
    intensidad_preferida?: string;
    ocasiones?: string[];
    clima_preferido?: string[];
  }
  const preferences = (profile?.preferences as UserPreferences | null) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal y perfil olfativo
        </p>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu información de contacto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Tu nombre completo"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+595 981 123456"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <Button type="submit">Guardar Cambios</Button>
          </form>
        </CardContent>
      </Card>

      {/* Perfil Olfativo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mi Perfil Olfativo</CardTitle>
              <CardDescription>
                Tus preferencias de perfumes personalizadas
              </CardDescription>
            </div>
            <Dialog open={showRerunDialog} onOpenChange={setShowRerunDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">Re-hacer Onboarding</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Reiniciar tu perfil olfativo?</DialogTitle>
                  <DialogDescription>
                    Esto eliminará tus preferencias actuales y deberás completar el onboarding nuevamente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRerunDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRerunOnboarding}>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Familias Favoritas */}
          {preferences.familias_favoritas && preferences.familias_favoritas.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Familias Olfativas Favoritas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {families
                  .filter((family) =>
                    preferences.familias_favoritas?.includes(family.id) ?? false
                  )
                  .map((family) => (
                    <OlfactoryFamilyCard
                      key={family.id}
                      family={family}
                      isSelected={true}
                      onSelect={() => {}}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Intensidad Preferida */}
          {preferences.intensidad_preferida && (
            <div>
              <h3 className="font-semibold mb-3">Intensidad Preferida</h3>
              <Badge variant="secondary" className="text-base px-4 py-2">
                {preferences.intensidad_preferida}
              </Badge>
            </div>
          )}

          {/* Ocasiones */}
          {preferences.ocasiones && preferences.ocasiones.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Ocasiones de Uso</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.ocasiones.map((occasion: string) => (
                  <Badge key={occasion} variant="outline">
                    {occasion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Clima Preferido */}
          {preferences.clima_preferido && preferences.clima_preferido.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Preferencias de Clima</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.clima_preferido.map((climate: string) => {
                  const icons: Record<string, string> = {
                    Caluroso: '☀️',
                    Templado: '☁️',
                    Frío: '❄️',
                  };
                  return (
                    <Badge key={climate} variant="outline" className="text-base">
                      {icons[climate]} {climate}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {!profile?.onboarding_completed && (
            <div className="text-center py-8 border-t">
              <p className="text-muted-foreground mb-4">
                Aún no has completado tu perfil olfativo
              </p>
              <Button onClick={() => router.push('/onboarding')}>
                Completar Onboarding
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

