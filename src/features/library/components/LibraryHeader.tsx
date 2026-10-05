import React from 'react';
import { FolderSearch, Plus, BookCopy } from 'lucide-react';

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
  return (
    <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
      {/* Título y resumen */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 text-purple-400">
          <BookCopy className="h-5 w-5 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white m-0">
            Biblioteca
          </h1>
          <p className="text-xs text-zinc-400 font-normal m-0 mt-0.5">
            {totalComics === 0
              ? 'Sin cómics importados'
              : totalComics === 1
              ? '1 cómic disponible'
              : `${totalComics} cómics disponibles`}
          </p>
        </div>
      </div>

      {/* Botones de acción principales */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onScanDirectory}
          disabled={isScanning}
          className="flex h-9 items-center gap-2 rounded-full bg-zinc-900 px-4 text-xs font-medium text-zinc-200 border border-white/[0.08] hover:bg-zinc-800 hover:text-white active:scale-95 transition-all disabled:opacity-50"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75] text-zinc-400" />
          <span>{isScanning ? 'Escaneando...' : 'Escanear carpeta'}</span>
        </button>

        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-9 items-center gap-2 rounded-full bg-purple-600 px-4 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Abrir cómic(s)</span>
        </button>
      </div>
    </header>
  );
};
