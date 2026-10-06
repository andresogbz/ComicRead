import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface ComicCollectionModalProps {
  comic: StoredComic;
  existingCollections: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: string | undefined) => void;
}

export const ComicCollectionModal: React.FC<ComicCollectionModalProps> = ({
  comic,
  existingCollections,
  isOpen,
  onClose,
  onSave,
}) => {
  const [collectionName, setCollectionName] = useState(comic.collection || '');
  const { primaryColor } = useThemeStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(collectionName.trim() || undefined);
    onClose();
  };

  const handleSelectExisting = (name: string) => {
    setCollectionName(name);
  };

  const handleRemove = () => {
    onSave(undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0C0C0E] border border-zinc-800 p-6 flex flex-col gap-4 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera plana */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">
              Organizar en colección
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 line-clamp-1">
          Cómic: <span className="text-white font-medium">{comic.title}</span>
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="collection-input" className="text-xs text-zinc-400 font-medium">
            Nombre de la saga o colección
          </label>
          <div className="flex items-center gap-2">
            <input
              id="collection-input"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Ej. Batman, Marvel, Manga..."
              className="flex-1 h-9 bg-zinc-900 border border-zinc-800 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              autoFocus
            />
          </div>

          {/* Colecciones existentes para asignar en un clic */}
          {existingCollections.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-[11px] text-zinc-500">Colecciones sugeridas:</span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {existingCollections.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelectExisting(col)}
                    className={`text-[11px] px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                      collectionName.toLowerCase() === col.toLowerCase()
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-900 mt-2">
            {comic.collection ? (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Quitar de colección
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-opacity cursor-pointer active:scale-95"
                style={{ backgroundColor: primaryColor.hex }}
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
