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
    <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
      {/* Título y resumen */}
      <div className="flex items-center gap-2.5">
        <BookCopy
          className="h-6 w-6 stroke-[2] shrink-0"
          style={{ color: primaryColor.hex }}
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white transition-colors m-0">
            Biblioteca
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal transition-colors m-0 mt-0.5">
            {totalComics === 0
              ? 'Sin cómics importados'
              : totalComics === 1
              ? '1 cómic disponible'
              : `${totalComics} cómics disponibles`}
          </p>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Botón de Escanear Carpeta (sin bordes) */}
        <button
          type="button"
          onClick={onScanDirectory}
          disabled={isScanning}
          className="flex h-9 items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-4 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all disabled:opacity-50"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75] text-zinc-500 dark:text-zinc-400" />
          <span>{isScanning ? 'Escaneando...' : 'Escanear carpeta'}</span>
        </button>

        {/* Botón de Importar Cómics plano sin sombras */}
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-9 items-center gap-2 rounded-full px-4 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: primaryColor.hex,
          }}
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Abrir cómic(s)</span>
        </button>
      </div>
    </header>
  );
};

