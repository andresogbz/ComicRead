import React from 'react';
import { Heart, Trash2, BookOpen, CheckCircle } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface ComicCardProps {
  comic: StoredComic;
  onOpen: (comic: StoredComic) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

/**
 * Tarjeta de cómic sin bordes ni fondos propios: se fusiona 100% con el fondo de la pantalla.
 */
export const ComicCard: React.FC<ComicCardProps> = ({
  comic,
  onOpen,
  onToggleFavorite,
  onDelete,
}) => {
  const { primaryColor } = useThemeStore();
  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div
      onClick={() => onOpen(comic)}
      className="group relative flex flex-col bg-transparent cursor-pointer select-none transition-all duration-300 ease-out hover:-translate-y-1.5"
      role="button"
      tabIndex={0}
      aria-label={`Abrir ${comic.title}`}
    >
      {/* Contenedor de la Portada flotante, sin bordes y fusionado */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-black/5 dark:bg-white/[0.04] shadow-md transition-all duration-300 group-hover:shadow-2xl"
        style={{
          boxShadow: undefined,
        }}
      >
        {comic.coverDataUrl ? (
          <img
            src={comic.coverDataUrl}
            alt={comic.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-zinc-400 dark:text-zinc-600">
            <BookOpen className="h-10 w-10 mb-2 stroke-[1.5]" />
            <span className="text-xs font-medium text-zinc-500">Sin portada</span>
          </div>
        )}

        {/* Gradiente superior sutil para legibilidad de botones */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Badge de formato sin bordes */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white backdrop-blur-md">
            {comic.format}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-md">
              <CheckCircle className="h-3 w-3 stroke-[2.5]" />
              Leído
            </span>
          )}
        </div>

        {/* Botón de Favorito */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(comic.id, e)}
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          aria-label={comic.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <Heart
            className={`h-4 w-4 stroke-[2] transition-colors ${
              comic.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80 hover:text-white'
            }`}
          />
        </button>

        {/* Botón de Eliminar */}
        <button
          type="button"
          onClick={(e) => onDelete(comic.id, e)}
          className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:text-rose-400 hover:scale-110 active:scale-95"
          aria-label="Eliminar cómic"
        >
          <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
        </button>

        {/* Barra de progreso con el color primario dinámico */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30 backdrop-blur-xs">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${comic.progressPercentage}%`,
              backgroundColor: isCompleted ? '#10b981' : primaryColor.hex,
            }}
          />
        </div>
      </div>

      {/* Información del Cómic fusionada de forma natural con la página */}
      <div className="mt-2 flex flex-col px-0.5 bg-transparent">
        <h3
          className="line-clamp-1 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-100 transition-colors"
          style={{
            color: undefined,
          }}
          title={comic.title}
        >
          {comic.title}
        </h3>
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
          <span>
            {isStarted
              ? `Pág. ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
              : `${comic.totalPages} págs.`}
          </span>
          {isStarted && (
            <span
              className="font-semibold text-[10px]"
              style={{ color: primaryColor.hex }}
            >
              {comic.progressPercentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
