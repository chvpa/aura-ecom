"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const SEARCH_PLACEHOLDERS = [
  "quiero un perfume para regalar a un hombre 😊",
  "quiero un perfume para levantar 😎🔥",
  "Quiero el que mas piropos da 💋",
  "Para detonar 👀💣",
];

const POPULAR_SEARCHES = [
  "💕 Para una cita",
  "🌧️ Olor a lluvia",
  "🎁 Regalo para mamá",
];

export function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (isInputFocused || searchQuery) {
      return;
    }

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isInputFocused, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/busqueda-ia?query=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    setIsInputFocused(true);
    // Opcional: hacer focus en el input
    const input = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center px-4 py-20 bg-white">
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #FFF991 0%, transparent 70%)
          `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="z-10 mx-auto w-full max-w-4xl space-y-8 text-center">
        {/* Título y subtítulo */}
        <div className="space-y-6">
          <h1 className="!text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl font-bold tracking-tight">
            <span className="block">Encuentra tu esencia.</span>
            <span className="block">Solo pregunta.</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-neutral-500 md:text-lg">
            Descubrí tu perfume ideal con nuestra IA. Describí la ocasión, el
            <br className="hidden sm:block" />
            sentimiento o el aroma que quieras.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-xl border-3 border-purple-300 bg-white p-2 shadow-lg shadow-purple-500/20 transition-all focus-within:border-purple-500 focus-within:shadow-purple-500/30">
            {/* Icono de sparkles */}
            <div className="pl-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>

            {/* Input */}
            <div className="relative flex-1">
              {!searchQuery && !isInputFocused && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2"
                  >
                    <span className="text-sm text-neutral-500">
                      Ej: {SEARCH_PLACEHOLDERS[placeholderIndex]}
                    </span>
                  </motion.div>
                </AnimatePresence>
              )}
              <Input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="h-12 border-0 bg-transparent pr-4 pl-0 text-base text-neutral-900 shadow-none placeholder:text-neutral-500 focus-visible:ring-0"
              />
            </div>

            {/* Botón de búsqueda */}
            <Button
              type="submit"
              disabled={!searchQuery.trim()}
              className="h-12 rounded-lg px-6 font-medium transition-all shadow-lg shadow-primary/30 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
            >
              Buscar con IA
            </Button>
          </div>
        </form>

        {/* Búsquedas populares */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs tracking-wider text-neutral-400 uppercase">
            Populares:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((search, index) => (
              <button
                key={index}
                onClick={() => handlePopularSearch(search)}
                className="rounded-full border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-600 transition-all duration-200 hover:border-purple-400 hover:text-purple-600"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
