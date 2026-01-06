'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { onboardingSchema, type OnboardingInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { FamilySelectionStep } from './steps/FamilySelectionStep';
import { IntensityStep } from './steps/IntensityStep';
import { OccasionsStep } from './steps/OccasionsStep';
import { ClimateStep } from './steps/ClimateStep';

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingInput>>({
    familias_favoritas: [],
    intensidad_preferida: 'Moderada' as 'Baja' | 'Moderada' | 'Alta',
    ocasiones: [],
    clima_preferido: [],
  });
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          Array.isArray(formData.familias_favoritas) &&
          formData.familias_favoritas.length >= 1 &&
          formData.familias_favoritas.length <= 5
        );
      case 2:
        return !!formData.intensidad_preferida;
      case 3:
        return (
          Array.isArray(formData.ocasiones) && formData.ocasiones.length >= 1
        );
      case 4:
        return (
          Array.isArray(formData.clima_preferido) &&
          formData.clima_preferido.length >= 1
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor completa este paso antes de continuar');
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingWizard.tsx:74',message:'Onboarding complete initiated',data:{currentStep,formData,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!validateStep(currentStep)) {
      toast.error('Por favor completa este paso antes de continuar');
      return;
    }

    // Validar todos los datos
    const validation = onboardingSchema.safeParse(formData);
    if (!validation.success) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      // Verificar que el usuario existe en la tabla users, si no existe, crearlo
      const { data: userData, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingWizard.tsx:100',message:'User check result',data:{hasUserData:!!userData,hasError:!!userCheckError,errorMessage:userCheckError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (userCheckError || !userData) {
        // Si el usuario no existe en la tabla users, crearlo
        console.warn('User not found in users table, creating it...', userCheckError);
        const { data: authUser } = await supabase.auth.getUser();
        
        if (!authUser.user) {
          toast.error('Error: Sesión inválida. Por favor, inicia sesión nuevamente.');
          router.push('/login');
          return;
        }

        const insertPayload = {
          id: authUser.user.id,
          email: authUser.user.email || '',
          full_name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.fullName || null,
        };
        const { error: createUserError } = await (supabase.from('users') as any).insert(insertPayload);

        if (createUserError) {
          console.error('Error creating user record:', createUserError);
          toast.error('Error al crear el registro de usuario. Intenta nuevamente.');
          return;
        }
      }

      // Intentar insertar o actualizar el perfil
      // Supabase automáticamente detecta el conflicto en user_id (UNIQUE) y hace UPDATE
      const profileData = {
        user_id: user.id,
        preferences: {
          familias_favoritas: formData.familias_favoritas,
          intensidad_preferida: formData.intensidad_preferida,
          ocasiones: formData.ocasiones,
          clima_preferido: formData.clima_preferido,
        },
        onboarding_completed: true,
      };
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingWizard.tsx:128',message:'Upserting profile',data:{profileData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const { data, error } = await (supabase.from('user_profiles') as any)
        .upsert(profileData)
        .select()
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingWizard.tsx:142',message:'Profile upsert result',data:{hasData:!!data,hasError:!!error,errorMessage:error?.message,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (error) {
        console.error('Error saving profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error(`Error al guardar el perfil: ${error.message || 'Error desconocido'}`);
        return;
      }

      toast.success('¡Perfil creado exitosamente!');
      router.push('/cuenta/perfil');
      // router.refresh() se ejecutará automáticamente después del push
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorMessage =
        (error instanceof Error && error.message) || 
        (typeof error === 'object' && error !== null && 'details' in error && typeof error.details === 'string' ? error.details : null) ||
        'Error desconocido al guardar el perfil';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crea tu Perfil Olfativo</h1>
        <p className="text-muted-foreground">
          Paso {currentStep} de {TOTAL_STEPS}
        </p>
        <Progress value={progress} className="mt-4" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <FamilySelectionStep
              selectedFamilies={formData.familias_favoritas || []}
              onSelectionChange={(families) =>
                setFormData({ ...formData, familias_favoritas: families })
              }
            />
          )}
          {currentStep === 2 && (
            <IntensityStep
              intensity={formData.intensidad_preferida || 'Moderada'}
              onIntensityChange={(intensity) =>
                setFormData({ ...formData, intensidad_preferida: intensity as 'Baja' | 'Moderada' | 'Alta' })
              }
            />
          )}
          {currentStep === 3 && (
            <OccasionsStep
              occasions={formData.ocasiones || []}
              onOccasionsChange={(occasions) =>
                setFormData({ ...formData, ocasiones: occasions })
              }
            />
          )}
          {currentStep === 4 && (
            <ClimateStep
              climates={formData.clima_preferido || []}
              onClimatesChange={(climates) =>
                setFormData({ ...formData, clima_preferido: climates })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSaving}
        >
          Anterior
        </Button>
        {currentStep < TOTAL_STEPS ? (
          <Button onClick={handleNext} disabled={isSaving}>
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Completar'}
          </Button>
        )}
      </div>
    </div>
  );
}

