import React from 'react';
import { Plus } from 'lucide-react';
import { useThemeStore } from '../../core/theme/useThemeStore';
import type { AppTab } from './FloatingBubbleMenu';

export type { AppTab };

interface AppNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  totalComics: number;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  isScanning: boolean;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  onTabChange,
  onPickFiles,
}) => {
  const { primaryColor } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-gradient-to-b from-black/60 via-black/20 to-transparent transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Logo OGMIC con fuente normal en bold */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className="flex items-center text-left focus:outline-none group cursor-pointer shrink-0"
          aria-label="Ir a Inicio - OGMIC"
        >
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-white transition-opacity group-hover:opacity-80">
            OGMIC
          </span>
        </button>

        {/* Acción superior: Botón plano de Agregar Cómic */}
        <button
          type="button"
          onClick={onPickFiles}
          className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full px-3.5 sm:px-4 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer shrink-0"
          style={{
            backgroundColor: primaryColor.hex,
          }}
          title="Agregar cómic"
          aria-label="Agregar cómic"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Agregar cómic</span>
        </button>
      </div>
    </header>
  );
};
