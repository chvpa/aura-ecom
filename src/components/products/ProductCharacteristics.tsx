import { Clock, Wind, Zap, Snowflake } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCharacteristicsProps {
  product: Product;
}

export function ProductCharacteristics({
  product,
}: ProductCharacteristicsProps) {
  const seasonRecommendations = product.season_recommendations as
    | {
        invierno?: number;
        primavera?: number;
        verano?: number;
        otono?: number;
      }
    | null;

  // Obtener la temporada con mayor porcentaje
  const getTopSeason = () => {
    if (!seasonRecommendations) return null;
    const seasons = [
      { name: 'Invierno', value: seasonRecommendations.invierno || 0 },
      { name: 'Primavera', value: seasonRecommendations.primavera || 0 },
      { name: 'Verano', value: seasonRecommendations.verano || 0 },
      { name: 'Otoño', value: seasonRecommendations.otono || 0 },
    ];
    const topSeason = seasons.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );
    return topSeason.value > 50 ? topSeason.name : null;
  };

  // Formatear duración
  const getDuration = () => {
    if (!product.longevity_hours) return null;
    const hours = product.longevity_hours;
    if (hours >= 8) return '8-10 hrs';
    if (hours >= 6) return '6-8 hrs';
    if (hours >= 4) return '4-6 hrs';
    return `${hours} hrs`;
  };

  // Mapear intensidad (si existe el campo, sino usar sillage como proxy)
  const getIntensity = () => {
    const characteristics = product.characteristics as Record<string, unknown> | null;
    if (characteristics && typeof characteristics === 'object' && 'intensidad' in characteristics) {
      return characteristics.intensidad as string;
    }
    // Usar sillage como proxy para intensidad
    if (product.sillage_category) {
      const sillage = product.sillage_category.toLowerCase();
      if (sillage.includes('alta') || sillage.includes('strong')) return 'Alta';
      if (sillage.includes('moderada') || sillage.includes('moderate')) return 'Moderada';
      if (sillage.includes('baja') || sillage.includes('light')) return 'Baja';
    }
    return product.sillage_category || 'Moderada';
  };

  const characteristics = [
    {
      icon: Clock,
      title: 'DURACIÓN',
      value: getDuration(),
      show: !!product.longevity_hours,
    },
    {
      icon: Wind,
      title: 'ESTELA',
      value: product.sillage_category || 'Moderada',
      show: true,
    },
    {
      icon: Zap,
      title: 'INTENSIDAD',
      value: getIntensity(),
      show: true,
    },
    {
      icon: Snowflake,
      title: 'ESTACIÓN',
      value: getTopSeason() || 'Todo el año',
      show: true,
    },
  ].filter((char) => char.show);

  return (
    <div className="space-y-4">
      {/* Tarjetas de características */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {characteristics.map((char, index) => {
          const Icon = char.icon;
          return (
            <div
              key={index}
              className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex flex-col items-center text-center"
            >
              <Icon className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {char.title}
              </p>
              <p className="text-sm font-semibold">{char.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

