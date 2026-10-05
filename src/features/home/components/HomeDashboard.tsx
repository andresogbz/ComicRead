import React, { useMemo } from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { HomeHero } from './HomeHero';
import { DashboardStats } from './DashboardStats';
import { QuickTasksMenu } from './QuickTasksMenu';
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
  stats,
  onOpenComic,
  onToggleFavorite,
  onDeleteComic,
  onPickFiles,
  onScanDirectory,
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

  // Cómics recientemente añadidos (máx 6)
  const recentlyAdded = useMemo(() => {
    return [...comics].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
  }, [comics]);

  // Cómics favoritos (máx 6)
  const favoriteComics = useMemo(() => {
    return comics.filter((c) => !!c.isFavorite).slice(0, 6);
  }, [comics]);

  return (
    <div className="flex flex-col gap-10 sm:gap-12 pb-16">
      {/* Sección Hero: Continuar Lectura */}
      <HomeHero
        comic={heroComic}
        onOpenComic={onOpenComic}
        onPickFiles={onPickFiles}
      />

      {/* Resumen de Estadísticas del Dashboard */}
      {stats.total > 0 && <DashboardStats stats={stats} />}

      {/* Menú de Cosas por Hacer / Acciones Rápidas */}
      <QuickTasksMenu
        onPickFiles={onPickFiles}
        onScanDirectory={onScanDirectory}
        onGoToLibrary={onGoToLibrary}
        onResumeReading={heroComic ? () => onOpenComic(heroComic) : undefined}
        hasComicsInProgress={stats.inProgress > 0}
      />

      {/* Recientemente Añadidos */}
      {recentlyAdded.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 stroke-[2]"
                style={{ color: primaryColor.hex }}
              />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white m-0">
                Recién agregados
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart
                className="h-4 w-4 stroke-[2]"
                style={{ color: primaryColor.hex }}
              />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white m-0">
                Tus favoritos
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
