import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { HomeHero } from './HomeHero';
import { ComicCard } from '../../library/components/ComicCard';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface HomeDashboardProps {
  comics: StoredComic[];
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
  };
  onOpenComic: (comic: StoredComic) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteComic: (id: string, e: React.MouseEvent) => void;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  onGoToLibrary: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  comics,
  onOpenComic,
  onToggleFavorite,
  onDeleteComic,
  onPickFiles,
  onGoToLibrary,
}) => {
  const { primaryColor } = useThemeStore();

  // Cómic destacado para Hero: el más recientemente leído que esté en progreso, o el último añadido
  const heroComic = useMemo(() => {
    if (comics.length === 0) return null;
    const inProgress = comics
      .filter((c) => c.progressPercentage > 0 && c.progressPercentage < 100)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));

    if (inProgress.length > 0) return inProgress[0];
    return comics[0];
  }, [comics]);

  // Cómics en progreso (para sección de Continuar Leyendo)
  const inProgressComics = useMemo(() => {
    return comics.filter(
      (c) => c.progressPercentage > 0 && c.progressPercentage < 100
    );
  }, [comics]);

  // Cómics recientemente añadidos (máx 6)
  const recentlyAdded = useMemo(() => {
    return [...comics].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
  }, [comics]);

  // Cómics favoritos (máx 6)
  const favoriteComics = useMemo(() => {
    return comics.filter((c) => !!c.isFavorite).slice(0, 6);
  }, [comics]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-24">
      {/* Sección Hero con fondo de tarjeta distintivo sobre el fondo global */}
      <div className="rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md p-6 sm:p-8 border border-white/10 shadow-xl transition-all">
        <HomeHero
          comic={heroComic}
          onOpenComic={onOpenComic}
          onPickFiles={onPickFiles}
        />
      </div>

      {/* Cómics en curso (Continuar leyendo) si existen */}
      {inProgressComics.length > 0 && (
        <section className="flex flex-col p-5 sm:p-7 rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 shadow-xl transition-all">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                En curso
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0 mt-1">
                Continuar leyendo
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver estantería</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {inProgressComics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recién agregados */}
      {recentlyAdded.length > 0 && (
        <section className="flex flex-col p-5 sm:p-7 rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 shadow-xl transition-all">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Catálogo reciente
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0 mt-1">
                Recién agregados
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {recentlyAdded.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* Favoritos si existen */}
      {favoriteComics.length > 0 && (
        <section className="flex flex-col p-5 sm:p-7 rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 shadow-xl transition-all">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Colección destacada
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0 mt-1">
                Tus favoritos
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {favoriteComics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
