import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ImportProgress } from '../stores/useLibraryStore';

interface ImportProgressModalProps {
  progress: ImportProgress;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  progress,
}) => {
  const percentage = Math.round((progress.current / Math.max(1, progress.total)) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2 rounded-2xl bg-zinc-900/95 p-4 text-white shadow-2xl shadow-black/80 backdrop-blur-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          <span className="text-xs font-semibold">Procesando cómics</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          {progress.current}/{progress.total} ({percentage}%)
        </span>
      </div>

      <p className="line-clamp-1 text-[11px] text-zinc-400 font-mono">
        {progress.currentFileName}
      </p>

      {/* Barra de progreso */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
