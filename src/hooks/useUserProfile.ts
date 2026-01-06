'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      const rafId = requestAnimationFrame(() => {
        setProfile(null);
        setLoading(false);
      });
      return () => cancelAnimationFrame(rafId);
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const { data, error } = await (supabase.from('user_profiles') as any)
      .upsert({
        user_id: user.id,
        ...updates,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
    return data;
  };

  return {
    profile,
    loading,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    updateProfile,
  };
}

