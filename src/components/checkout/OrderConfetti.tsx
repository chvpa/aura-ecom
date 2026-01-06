'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar dinámicamente para evitar problemas de SSR
const Confetti = dynamic(
  () => import('react-confetti-boom'),
  {
    ssr: false,
    loading: () => null,
  }
);

export function OrderConfetti() {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Usar requestAnimationFrame para evitar setState síncrono en efecto
    const rafId = requestAnimationFrame(() => {
      setMounted(true);
    });
    
    // Ocultar el confetti después de 4 segundos
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted || !showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Confetti
        mode="boom"
        x={0.5}
        y={0.5}
        particleCount={100}
        shapeSize={12}
        spreadDeg={45}
        effectCount={3}
        effectInterval={300}
        launchSpeed={2}
      />
    </div>
  );
}

