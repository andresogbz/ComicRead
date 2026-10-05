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
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-black/[0.02] dark:bg-white/[0.02] transition-colors">
        <div
          className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full blur-3xl opacity-40 transition-colors"
          style={{ backgroundColor: primaryColor.glow }}
        />
        <div className="max-w-xl">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: primaryColor.hex }}
          >
            Lector de Cómics de Alto Rendimiento
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Bienvenido a tu Espacio de Lectura
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Soporte nativo para archivos .cbz, .cbr y cómics Webtoon verticales.
            Comienza importando tus historias favoritas desde tu almacenamiento local.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-10 items-center gap-2 rounded-full px-5 text-xs font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: primaryColor.hex,
                boxShadow: `0 4px 16px ${primaryColor.glow}`,
              }}
            >
              <BookOpen className="h-4 w-4 stroke-[2]" />
              <span>Importar cómic</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-black/[0.02] dark:bg-white/[0.02] transition-colors group">
      {/* Resplandor ambiental suave de fondo */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-35 transition-colors"
        style={{ backgroundColor: primaryColor.glow }}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        {/* Portada Flotante sin caja contenedora */}
        <div
          onClick={() => onOpenComic(comic)}
          className="relative aspect-[2/3] w-36 sm:w-44 shrink-0 overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] cursor-pointer"
        >
          {comic.coverDataUrl ? (
            <img
              src={comic.coverDataUrl}
              alt={comic.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/10 dark:bg-white/10 text-zinc-500">
              <BookOpen className="h-8 w-8 stroke-[1.5]" />
            </div>
          )}
          <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-md">
            {comic.format}
          </span>
        </div>

        {/* Detalles y llamada a la acción */}
        <div className="flex flex-1 flex-col justify-between self-stretch py-1 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold">
              <span
                className="uppercase tracking-wider text-[11px]"
                style={{ color: primaryColor.hex }}
              >
                {isCompleted ? 'Lectura completada' : isStarted ? 'En progreso' : 'Recién agregado'}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] flex items-center gap-1">
                <Clock className="h-3 w-3 stroke-[2]" />
                {comic.totalPages} páginas
              </span>
            </div>

            <h3
              onClick={() => onOpenComic(comic)}
              className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {comic.title}
            </h3>

            {/* Barra de progreso */}
            <div className="mt-4 max-w-md mx-auto sm:mx-0">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
                <span>
                  {isStarted
                    ? `Página ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                    : `${comic.totalPages} páginas en total`}
                </span>
                <span className="font-semibold" style={{ color: primaryColor.hex }}>
                  {comic.progressPercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.max(4, comic.progressPercentage)}%`,
                    backgroundColor: isCompleted ? '#10b981' : primaryColor.hex,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botón para continuar lectura */}
          <div className="mt-6 flex items-center justify-center sm:justify-start gap-3">
            <button
              type="button"
              onClick={() => onOpenComic(comic)}
              className="flex h-10 items-center gap-2 rounded-full px-6 text-xs font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: primaryColor.hex,
                boxShadow: `0 4px 16px ${primaryColor.glow}`,
              }}
            >
              <Play className="h-4 w-4 fill-white stroke-[2]" />
              <span>{isStarted ? 'Continuar leyendo' : 'Empezar a leer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
