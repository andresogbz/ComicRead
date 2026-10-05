import React from 'react';
import { FolderSearch, Plus, BookCopy } from 'lucide-react';
import { ThemeControls } from '../../../shared/components/ThemeControls';
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
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl transition-colors shadow-sm"
          style={{
            backgroundColor: `${primaryColor.hex}18`,
            color: primaryColor.hex,
          }}
        >
          <BookCopy className="h-5 w-5 stroke-[2]" />
        </div>
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

      {/* Controles de tema y acciones principales */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Controles de Modo Claro/Oscuro y Selector de Color Primario */}
        <ThemeControls />

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

        {/* Botón de Importar Cómics con Color Primario Dinámico */}
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-9 items-center gap-2 rounded-full px-4 text-xs font-semibold text-white shadow-md active:scale-95 transition-all"
          style={{
            backgroundColor: primaryColor.hex,
            boxShadow: `0 4px 14px ${primaryColor.glow}`,
          }}
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Abrir cómic(s)</span>
        </button>
      </div>
    </header>
  );
};

