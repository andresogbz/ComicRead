import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ImportProgress } from '../stores/useLibraryStore';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface ImportProgressModalProps {
  progress: ImportProgress;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  progress,
}) => {
  const { primaryColor } = useThemeStore();
  const percentage = Math.round((progress.current / Math.max(1, progress.total)) * 100);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex flex-col gap-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: primaryColor.hex }}
          />
          <span className="text-xs font-semibold">Procesando cómics</span>
        </div>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {progress.current}/{progress.total} ({percentage}%)
        </span>
      </div>

      <p className="line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
        {progress.currentFileName}
      </p>

      {/* Barra de progreso con color primario */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full transition-all duration-200 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: primaryColor.hex,
          }}
        />
      </div>
    </div>
  );
};

