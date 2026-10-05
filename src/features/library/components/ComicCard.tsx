import React from 'react';
import { Heart, Trash2, BookOpen, CheckCircle } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';

interface ComicCardProps {
  comic: StoredComic;
  onOpen: (comic: StoredComic) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

/**
 * Tarjeta de cómic con diseño squircle estilo Apple, indicador de progreso y micro-interacciones.
 */
export const ComicCard: React.FC<ComicCardProps> = ({
  comic,
  onOpen,
  onToggleFavorite,
  onDelete,
}) => {
  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;

  return (
    <div
      onClick={() => onOpen(comic)}
      className="group relative flex flex-col cursor-pointer select-none transition-all duration-300 ease-out hover:-translate-y-1.5"
      role="button"
      tabIndex={0}
      aria-label={`Abrir ${comic.title}`}
    >
      {/* Contenedor de la Portada con squircle y brillo sutil */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/[0.08] shadow-lg shadow-black/40 group-hover:border-white/20 group-hover:shadow-purple-500/10 transition-all duration-300">
        {comic.coverDataUrl ? (
          <img
            src={comic.coverDataUrl}
            alt={comic.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 text-zinc-600 p-4 text-center">
            <BookOpen className="h-10 w-10 mb-2 stroke-[1.5] text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">Sin portada</span>
          </div>
        )}

        {/* Gradiente oscuro superior para legibilidad de badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />

        {/* Insignia de Formato (Pill translúcido) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-zinc-200 backdrop-blur-md border border-white/10">
            {comic.format}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <CheckCircle className="h-3 w-3 stroke-[2.5]" />
              Leído
            </span>
          )}
        </div>

        {/* Botón de Favorito */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(comic.id, e)}
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 opacity-80 transition-all hover:scale-110 hover:opacity-100 active:scale-95"
          aria-label={comic.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <Heart
            className={`h-4 w-4 stroke-[2] transition-colors ${
              comic.isFavorite
                ? 'fill-rose-500 text-rose-500'
                : 'text-zinc-300 hover:text-white'
            }`}
          />
        </button>

        {/* Botón de Eliminar (visible en hover) */}
        <button
          type="button"
          onClick={(e) => onDelete(comic.id, e)}
          className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-zinc-400 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-400 hover:scale-110 active:scale-95"
          aria-label="Eliminar cómic"
        >
          <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
        </button>

        {/* Barra de progreso de lectura inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60 backdrop-blur-sm">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500'
                : isStarted
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                : 'bg-transparent'
            }`}
            style={{ width: `${comic.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Información del Cómic */}
      <div className="mt-2.5 flex flex-col px-0.5">
        <h3
          className="line-clamp-1 text-sm font-medium text-zinc-100 group-hover:text-purple-300 transition-colors"
          title={comic.title}
        >
          {comic.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400 font-normal">
          <span>
            {isStarted
              ? `Pág. ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
              : `${comic.totalPages} páginas`}
          </span>
          {isStarted && (
            <span className="font-medium text-purple-400">
              {comic.progressPercentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
