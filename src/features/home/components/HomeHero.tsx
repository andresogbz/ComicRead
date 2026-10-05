import React from 'react';
import { Play, BookOpen, Clock } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface HomeHeroProps {
  comic: StoredComic | null;
  onOpenComic: (comic: StoredComic) => void;
  onPickFiles: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  comic,
  onOpenComic,
  onPickFiles,
}) => {
  const { primaryColor } = useThemeStore();

  if (!comic) {
    return (
      <div className="relative rounded-3xl p-8 sm:p-14 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-2xl">
          <span
            className="text-xs font-semibold"
            style={{ color: primaryColor.hex }}
          >
            Lector de cómics minimalista
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Tu biblioteca personal de cómics
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Lectura rápida, sin distracciones y con soporte para archivos .cbz, .cbr y cómics verticales Webtoon. Comienza importando historias desde tu dispositivo.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-11 items-center gap-2 rounded-full px-6 text-xs sm:text-sm font-semibold text-white active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              <BookOpen className="h-4 w-4 stroke-[2]" />
              <span>Importar cómics</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div className="relative rounded-3xl p-6 sm:p-10 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Portada Flotante Plana, sin sombras */}
        <div
          onClick={() => onOpenComic(comic)}
          className="relative aspect-[2/3] w-40 sm:w-52 shrink-0 overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
        >
          {comic.coverDataUrl ? (
            <img
              src={comic.coverDataUrl}
              alt={comic.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <BookOpen className="h-10 w-10 stroke-[1.5]" />
            </div>
          )}
          {/* Badge de formato plano sin blur ni uppercase */}
          <span className="absolute top-2.5 left-2.5 rounded-full bg-zinc-900/90 text-white px-2.5 py-0.5 text-[10px] font-semibold">
            {comic.format.toUpperCase()}
          </span>
        </div>

        {/* Detalles y Titular Hero Impactante */}
        <div className="flex flex-1 flex-col justify-between self-stretch text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold">
              <span style={{ color: primaryColor.hex }}>
                {isCompleted ? 'Lectura completada' : isStarted ? 'En curso' : 'Recientemente agregado'}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-1 font-normal">
                <Clock className="h-3.5 w-3.5 stroke-[1.75]" />
                {comic.totalPages} páginas
              </span>
            </div>

            <h1
              onClick={() => onOpenComic(comic)}
              className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white line-clamp-2 hover:opacity-85 transition-opacity cursor-pointer leading-[1.15]"
            >
              {comic.title}
            </h1>

            {/* Barra de progreso plana */}
            <div className="mt-6 max-w-lg mx-auto md:mx-0">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                <span>
                  {isStarted
                    ? `Página ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                    : `${comic.totalPages} páginas`}
                </span>
                <span className="font-semibold" style={{ color: primaryColor.hex }}>
                  {comic.progressPercentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full transition-all duration-200 ease-out"
                  style={{
                    width: `${Math.max(3, comic.progressPercentage)}%`,
                    backgroundColor: isCompleted ? '#059669' : primaryColor.hex,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botón para continuar lectura plano sin sombras */}
          <div className="mt-8 flex items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={() => onOpenComic(comic)}
              className="flex h-11 items-center gap-2 rounded-full px-7 text-xs sm:text-sm font-semibold text-white active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              <Play className="h-4 w-4 fill-white stroke-[2]" />
              <span>{isStarted ? 'Continuar lectura' : 'Comenzar a leer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
