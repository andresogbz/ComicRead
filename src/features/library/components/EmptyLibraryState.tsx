import React, { useState } from 'react';
import { BookPlus, FolderSearch, UploadCloud } from 'lucide-react';

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
      className={`relative mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
        isDragOver
          ? 'border-purple-500 bg-purple-500/[0.04]'
          : 'border-white/[0.08] bg-zinc-950/40 hover:border-white/[0.15]'
      }`}
    >
      {/* Resplandor ambiental de fondo */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-purple-600/10 blur-3xl -z-10" />

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 text-zinc-400 mb-4">
        {isDragOver ? (
          <UploadCloud className="h-8 w-8 text-purple-400 animate-bounce stroke-[1.5]" />
        ) : (
          <BookPlus className="h-8 w-8 stroke-[1.5] text-purple-400" />
        )}
      </div>

      <h2 className="text-lg font-semibold text-white tracking-tight m-0">
        Tu estantería está vacía
      </h2>
      <p className="mt-1.5 max-w-sm text-xs text-zinc-400 leading-relaxed m-0">
        Arrastra y suelta tus cómics aquí, o utiliza los botones para importar
        archivos locales o carpetas completas.
      </p>

      {/* Badges de formatos admitidos */}
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-500">
        <span className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 border border-white/[0.06]">
          .CBZ (ZIP)
        </span>
        <span className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 border border-white/[0.06]">
          .CBR (RAR)
        </span>
        <span className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 border border-white/[0.06]">
          Extracción en background
        </span>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-9 items-center gap-2 rounded-full bg-purple-600 px-5 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-95 transition-all"
        >
          <BookPlus className="h-4 w-4 stroke-[2]" />
          <span>Seleccionar cómics</span>
        </button>

        <button
          type="button"
          onClick={onScanDirectory}
          className="flex h-9 items-center gap-2 rounded-full bg-zinc-900 px-4 text-xs font-medium text-zinc-300 border border-white/[0.08] hover:bg-zinc-800 hover:text-white active:scale-95 transition-all"
        >
          <FolderSearch className="h-4 w-4 stroke-[1.75] text-zinc-400" />
          <span>Escanear carpeta local</span>
        </button>
      </div>
    </div>
  );
};
