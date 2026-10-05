import React from 'react';
import { FolderSearch, Plus, BookCopy } from 'lucide-react';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface LibraryHeaderProps {
  totalComics: number;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  isScanning: boolean;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  totalComics,
  onPickFiles,
  onScanDirectory,
  isScanning,
}) => {
  const { primaryColor } = useThemeStore();

  return (
    <header className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-6">
      {/* Título y microcategoría estilo dashboard minimalista */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <BookCopy
            className="h-4 w-4 stroke-[2]"
            style={{ color: primaryColor.hex }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: primaryColor.hex }}
          >
            Colección local
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white transition-colors m-0">
          Biblioteca
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal transition-colors m-0 mt-1">
          {totalComics === 0
            ? 'Sin cómics importados en el almacenamiento'
            : totalComics === 1
            ? '1 cómic disponible para lectura'
            : `${totalComics} cómics listos en tu estantería`}
        </p>
      </div>

      {/* Acciones principales adaptativas */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Botón de Escanear Carpeta plano */}
        <button
          type="button"
          onClick={onScanDirectory}
          disabled={isScanning}
          className="flex h-8 sm:h-9 items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 sm:px-4 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75] text-zinc-500 dark:text-zinc-400" />
          <span>{isScanning ? 'Escaneando...' : 'Escanear carpeta'}</span>
        </button>

        {/* Botón de Abrir Cómics plano */}
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-8 sm:h-9 items-center gap-1.5 rounded-full px-3.5 sm:px-4 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: primaryColor.hex,
          }}
          aria-label="Abrir cómic"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Abrir cómic</span>
        </button>
      </div>
    </header>
  );
};

