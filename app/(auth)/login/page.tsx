'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/cuenta/perfil';
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:31',message:'Login form submitted',data:{email:data.email,redirectTo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:38',message:'Sign in response',data:{hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email o password incorrectos');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Verificar si tiene perfil completado
      const { data: userData } = await supabase.auth.getUser();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:50',message:'User data retrieved',data:{hasUser:!!userData.user,userId:userData.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (userData.user) {
        const { data: profile } = await (supabase
          .from('user_profiles') as any)
          .select('onboarding_completed')
          .eq('user_id', userData.user.id)
          .single() as { data: { onboarding_completed: boolean | null } | null; error: any };

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:57',message:'Profile check',data:{hasProfile:!!profile,onboardingCompleted:profile?.onboarding_completed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        toast.success('¡Bienvenido de vuelta!');
        
        if (profile?.onboarding_completed) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:58',message:'Redirecting to profile',data:{redirectTo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          router.push(redirectTo);
          router.refresh();
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:60',message:'Redirecting to onboarding',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          router.push('/onboarding');
          router.refresh();
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:65',message:'Login error caught',data:{error:(error as Error).message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      toast.error('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/register" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

