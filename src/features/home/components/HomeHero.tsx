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
      <div className="relative w-full pt-4 pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-semibold"
              style={{ color: primaryColor.hex }}
            >
              Lector multiformato
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1] m-0">
            Tu biblioteca personal de cómics
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal m-0 max-w-xl">
            Lectura fluida, sin distracciones y con soporte para archivos .cbz, .cbr y cómics verticales Webtoon. Comienza importando historias desde tu dispositivo.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-11 items-center gap-2 rounded-full px-6 text-xs sm:text-sm font-bold text-white active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor.hex }}
            >
              <span>Agregar cómics</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBook = comic.format === 'epub' || comic.format === 'txt' || comic.mediaType === 'book';
  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div className="relative w-full pt-2 pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors flex flex-col justify-end">
      {/* Contenido directamente sobre el lienzo de la app, sin cajas contenedoras */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 sm:gap-10">
        <div className="max-w-2xl flex-1">
          {/* Badges de estado, medio y formato */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="rounded-full px-3 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: primaryColor.hex }}
            >
              {isBook ? 'Libro' : 'Cómic'} · .{comic.format}
            </span>
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-0.5 text-[11px] font-medium text-white">
              {isCompleted ? 'Lectura completada' : isStarted ? 'En lectura activa' : 'Recientemente agregado'}
            </span>
            <span className="text-zinc-300 text-xs flex items-center gap-1 font-normal ml-1">
              <Clock className="h-3.5 w-3.5 stroke-[2]" />
              {isBook ? `${comic.totalPages} capítulos` : `${comic.totalPages} páginas`}
            </span>
          </div>

          {/* Título de la historia con fuente estándar en bold */}
          <h1
            onClick={() => onOpenComic(comic)}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white line-clamp-2 hover:opacity-90 transition-opacity cursor-pointer leading-[1.1] m-0"
          >
            {comic.title}
          </h1>

          {/* Barra de progreso integrada */}
          <div className="mt-5 max-w-md">
            <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5 font-medium">
              <span>
                {isStarted
                  ? isBook
                    ? `Capítulo ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                    : `Página ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                  : isBook
                  ? `${comic.totalPages} capítulos`
                  : `${comic.totalPages} páginas`}
              </span>
              <span className="font-bold text-white">
                {comic.progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-xs">
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
