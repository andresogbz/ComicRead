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
      className={`relative mt-4 flex min-h-[340px] flex-col items-center justify-center p-6 sm:p-12 text-center transition-colors ${
        isDragOver
          ? 'bg-black/[0.03] dark:bg-white/[0.03] rounded-3xl'
          : ''
      }`}
    >
      <div
        className="mb-4 transition-transform duration-200 hover:scale-105"
        style={{ color: primaryColor.hex }}
      >
        {isDragOver ? (
          <UploadCloud className="h-12 w-12 animate-bounce stroke-[1.5]" />
        ) : (
          <BookPlus className="h-12 w-12 stroke-[1.5]" />
        )}
      </div>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight m-0">
        Tu estantería está vacía
      </h2>
      <p className="mt-2 max-w-sm text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed m-0 font-normal">
        Arrastra tus cómics aquí o utiliza los botones para importar archivos locales o carpetas completas.
      </p>

      {/* Badges de formatos planos */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-3 py-1 font-medium">
          .cbz (zip)
        </span>
        <span className="rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-3 py-1 font-medium">
          .cbr (rar)
        </span>
        <span className="rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-3 py-1 font-medium">
          Extracción directa
        </span>
      </div>

      {/* Acciones planas sin sombras */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-10 items-center gap-2 rounded-full px-6 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: primaryColor.hex }}
        >
          <BookPlus className="h-4 w-4 stroke-[2]" />
          <span>Seleccionar cómics</span>
        </button>

        <button
          type="button"
          onClick={onScanDirectory}
          className="flex h-10 items-center gap-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75]" />
          <span>Escanear carpeta</span>
        </button>
      </div>
    </div>
  );
};
