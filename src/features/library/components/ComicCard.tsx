import React, { useState } from 'react';
import { Heart, Trash2, BookOpen, CheckCircle, Folder, Bookmark } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore } from '../../../core/theme/useThemeStore';
import { ComicCollectionModal } from './ComicCollectionModal';

interface ComicCardProps {
  comic: StoredComic;
  existingCollections?: string[];
  onOpen: (comic: StoredComic) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onUpdateCollection?: (id: string, collection: string | undefined) => void;
}

/**
 * Tarjeta de cómic moderna y minimalista: diseño plano, sin sombras, tipografía limpia.
 */
export const ComicCard: React.FC<ComicCardProps> = ({
  comic,
  existingCollections = [],
  onOpen,
  onToggleFavorite,
  onDelete,
  onUpdateCollection,
}) => {
  const { primaryColor } = useThemeStore();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const isCompleted = comic.progressPercentage >= 100;
  const isStarted = comic.progressPercentage > 0 && !isCompleted;
  const bookmarksCount = comic.bookmarks?.length || 0;

  const handleOpenCollectionModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = (collection: string | undefined) => {
    onUpdateCollection?.(comic.id, collection);
  };

  return (
    <>
      <div
        onClick={() => onOpen(comic)}
        className="group relative flex flex-col bg-transparent cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-label={`Abrir ${comic.title}`}
      >
        {/* Contenedor plano de la Portada sin sombras ni bordes */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]">
          {comic.coverDataUrl ? (
            <img
              src={comic.coverDataUrl}
              alt={comic.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-zinc-400">
              <BookOpen className="h-8 w-8 mb-2 stroke-[1.5]" />
              <span className="text-xs font-medium text-zinc-500">Sin portada</span>
            </div>
          )}

          {/* Gradiente superior sutil para legibilidad de botones */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Badges de formato y lectura planos */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                .{comic.format.toLowerCase()}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <CheckCircle className="h-3 w-3 stroke-[2.5]" />
                  Leído
                </span>
              )}
            </div>

            {/* Badge de Colección si existe */}
            {comic.collection && (
              <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 max-w-[120px] truncate">
                {comic.collection}
              </span>
            )}
          </div>

          {/* Botones de acción superiores */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {/* Botón de Asignar Colección */}
            <button
              type="button"
              onClick={handleOpenCollectionModal}
              className="p-1 text-white/80 opacity-0 group-hover:opacity-100 transition-all hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Asignar colección"
              title="Colección"
            >
              <Folder className="h-4 w-4 stroke-[2]" />
            </button>

            {/* Botón de Favorito plano sin círculos de fondo */}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(comic.id, e)}
              className="p-1 text-white transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={comic.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
            >
              <Heart
                className={`h-4 w-4 stroke-[2] transition-colors ${
                  comic.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80 hover:text-white'
                }`}
              />
            </button>
          </div>

          {/* Indicador de Marcadores guardados en la esquina inferior izquierda */}
          {bookmarksCount > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
              <Bookmark className="h-3 w-3 fill-amber-400 text-amber-400 stroke-[1.5]" />
              <span>{bookmarksCount}</span>
            </div>
          )}

          {/* Botón de Eliminar plano sin fondo */}
          <button
            type="button"
            onClick={(e) => onDelete(comic.id, e)}
            className="absolute bottom-2.5 right-2 p-1 text-white/80 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-400 hover:scale-110 active:scale-95 cursor-pointer z-10"
            aria-label="Eliminar cómic"
          >
            <Trash2 className="h-4 w-4 stroke-[2]" />
          </button>

          {/* Barra de progreso plana */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/25">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${comic.progressPercentage}%`,
                backgroundColor: isCompleted ? '#059669' : primaryColor.hex,
              }}
            />
          </div>
        </div>

        {/* Información del Cómic fusionada de forma natural */}
        <div className="mt-2.5 flex flex-col px-0.5">
          <h3
            className="line-clamp-1 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
            title={comic.title}
          >
            {comic.title}
          </h3>
          <div className="mt-0.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
            <span>
              {isStarted
                ? `Página ${comic.lastReadPageIndex + 1} de ${comic.totalPages}`
                : `${comic.totalPages} páginas`}
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

      {/* Modal para organizar colecciones */}
      <ComicCollectionModal
        comic={comic}
        existingCollections={existingCollections}
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleSaveCollection}
      />
    </>
  );
};
