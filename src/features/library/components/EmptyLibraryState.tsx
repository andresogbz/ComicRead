import React, { useState } from 'react';
import { BookPlus, FolderSearch, UploadCloud } from 'lucide-react';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface EmptyLibraryStateProps {
  onPickFiles: () => void;
  onScanDirectory: () => void;
  onFilesDropped: (files: File[]) => void;
}

export const EmptyLibraryState: React.FC<EmptyLibraryStateProps> = ({
  onPickFiles,
  onScanDirectory,
  onFilesDropped,
}) => {
  const { primaryColor } = useThemeStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesDropped(droppedFiles);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
        isDragOver
          ? 'bg-black/[0.06] dark:bg-white/[0.08] scale-[1.01]'
          : 'bg-black/[0.02] dark:bg-white/[0.02]'
      }`}
    >
      {/* Resplandor ambiental dinámico de fondo */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl -z-10 transition-colors duration-500"
        style={{ backgroundColor: primaryColor.glow }}
      />

      <div
        className="mb-4 transition-transform duration-300 hover:scale-105"
        style={{ color: primaryColor.hex }}
      >
        {isDragOver ? (
          <UploadCloud className="h-12 w-12 animate-bounce stroke-[1.5]" />
        ) : (
          <BookPlus className="h-12 w-12 stroke-[1.5]" />
        )}
      </div>

      <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight m-0 transition-colors">
        Tu estantería está vacía
      </h2>
      <p className="mt-1.5 max-w-sm text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed m-0 transition-colors">
        Arrastra y suelta tus cómics aquí, o utiliza los botones para importar
        archivos locales o carpetas completas.
      </p>

      {/* Badges de formatos admitidos sin bordes */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5">
          .CBZ (ZIP)
        </span>
        <span className="rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5">
          .CBR (RAR)
        </span>
        <span className="rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5">
          Extracción en background
        </span>
      </div>

      {/* CTAs sin bordes */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-9 items-center gap-2 rounded-full px-5 text-xs font-semibold text-white shadow-md active:scale-95 transition-all"
          style={{
            backgroundColor: primaryColor.hex,
            boxShadow: `0 4px 16px ${primaryColor.glow}`,
          }}
        >
          <BookPlus className="h-4 w-4 stroke-[2]" />
          <span>Seleccionar cómics</span>
        </button>

        <button
          type="button"
          onClick={onScanDirectory}
          className="flex h-9 items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-4 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75] text-zinc-500 dark:text-zinc-400" />
          <span>Escanear carpeta local</span>
        </button>
      </div>
    </div>
  );
};

