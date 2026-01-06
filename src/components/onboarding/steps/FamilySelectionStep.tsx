'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OlfactoryFamilyCard } from '../OlfactoryFamilyCard';
import type { Database } from '@/types/database.types';

type OlfactoryFamily = Database['public']['Tables']['olfactory_families']['Row'];

interface FamilySelectionStepProps {
  selectedFamilies: string[];
  onSelectionChange: (families: string[]) => void;
}

export function FamilySelectionStep({
  selectedFamilies,
  onSelectionChange,
}: FamilySelectionStepProps) {
  const [families, setFamilies] = useState<OlfactoryFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchFamilies = async () => {
      const { data, error } = await supabase.from('olfactory_families').select('*').order('name');

      if (error) {
        console.error('Error fetching families:', error);
        return;
      }

      setFamilies(data || []);
      setLoading(false);
    };

    fetchFamilies();
  }, [supabase]);

  const handleToggle = (familyId: string) => {
    if (selectedFamilies.includes(familyId)) {
      onSelectionChange(selectedFamilies.filter((id) => id !== familyId));
    } else {
      if (selectedFamilies.length < 5) {
        onSelectionChange([...selectedFamilies, familyId]);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando familias olfativas...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Selecciona tus familias olfativas favoritas</h2>
        <p className="text-muted-foreground">
          Elige entre 1 y 5 familias que más te gusten. Esto nos ayudará a recomendarte perfumes
          perfectos para ti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {families.map((family) => (
          <OlfactoryFamilyCard
            key={family.id}
            family={family}
            isSelected={selectedFamilies.includes(family.id)}
            onSelect={() => handleToggle(family.id)}
          />
        ))}
      </div>

      {selectedFamilies.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedFamilies.length} de 5 familias seleccionadas
        </p>
      )}
    </div>
  );
}

