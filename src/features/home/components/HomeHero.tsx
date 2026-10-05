import React from 'react';
import { Play, Clock } from 'lucide-react';
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
      <div className="relative w-full pt-2 pb-8 sm:pb-10 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-semibold"
              style={{ color: primaryColor.hex }}
            >
              Lector multiformato
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1] m-0">
            Tu biblioteca personal de cómics
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal m-0 max-w-xl">
            Lectura fluida, sin distracciones y con soporte para archivos .cbz, .cbr y cómics verticales Webtoon. Comienza importando historias desde tu dispositivo.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-11 items-center gap-2 rounded-full px-6 text-xs sm:text-sm font-semibold text-white active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              <span>Agregar cómics</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div className="relative w-full min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden transition-colors flex flex-col justify-end p-6 sm:p-10 lg:p-12 pb-8 sm:pb-12">
      {/* Portada en Fondo con atmósfera inmersiva */}
      {comic.coverDataUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={comic.coverDataUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center scale-105 filter blur-xs sm:blur-none"
          />
          {/* Capas de gradiente para garantizar legibilidad de alto contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-zinc-900" />
      )}

      {/* Contenido dentro de la portada */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 sm:gap-10">
        <div className="max-w-2xl flex-1">
          {/* Badges de estado y formato */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="rounded-full px-3 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primaryColor.hex }}
            >
              .{comic.format}
            </span>
            <span className="rounded-full bg-white/15 backdrop-blur-md px-3 py-0.5 text-[11px] font-medium text-white/90">
              {isCompleted ? 'Lectura completada' : isStarted ? 'En lectura activa' : 'Recientemente agregado'}
            </span>
            <span className="text-white/70 text-xs flex items-center gap-1 font-normal ml-1">
              <Clock className="h-3.5 w-3.5 stroke-[2]" />
              {comic.totalPages} páginas
            </span>
          </div>

          {/* Título de la historia */}
          <h1
            onClick={() => onOpenComic(comic)}
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white line-clamp-2 hover:opacity-90 transition-opacity cursor-pointer leading-[1.1] m-0"
          >
            {comic.title}
          </h1>

          {/* Barra de progreso integrada */}
          <div className="mt-5 max-w-md">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5 font-medium">
              <span>
                {isStarted
                  ? `Página ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                  : `${comic.totalPages} páginas`}
              </span>
              <span className="font-bold text-white">
                {comic.progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <div
                className="h-full transition-all duration-200 ease-out"
                style={{
                  width: `${Math.max(4, comic.progressPercentage)}%`,
                  backgroundColor: isCompleted ? '#10b981' : primaryColor.hex,
                }}
              />
            </div>
          </div>

          {/* Botón de acción destacado */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenComic(comic)}
              className="flex h-11 items-center gap-2.5 rounded-full px-7 text-xs sm:text-sm font-bold text-white active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              <Play className="h-4 w-4 fill-white stroke-[2]" />
              <span>{isStarted ? 'Continuar lectura' : 'Comenzar a leer'}</span>
            </button>
          </div>
        </div>

        {/* Tarjeta de portada física en la esquina (visible en tablet/desktop) */}
        {comic.coverDataUrl && (
          <div
            onClick={() => onOpenComic(comic)}
            className="hidden md:block relative aspect-[2/3] w-36 lg:w-44 shrink-0 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer ring-1 ring-white/20"
          >
            <img
              src={comic.coverDataUrl}
              alt={comic.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};
