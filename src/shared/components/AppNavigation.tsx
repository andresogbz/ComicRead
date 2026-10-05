import React, { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { useThemeStore } from '../../core/theme/useThemeStore';
import { SideMenuDrawer, type AppTab } from './SideMenuDrawer';

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
  activeTab,
  onTabChange,
  totalComics,
  onPickFiles,
  onScanDirectory,
  isScanning,
}) => {
  const { primaryColor } = useThemeStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Header completamente integrado, sin cajas, sin bordes pesados */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-gradient-to-b from-black/60 via-black/20 to-transparent transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          {/* Botón de Menú Lateral y Logo OGMIC con fuente normal en bold */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center text-white hover:opacity-75 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-6 w-6 stroke-[2]" />
            </button>

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
          </div>

          {/* Acción derecha: Botón plano de Agregar Cómic */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer shrink-0"
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
        </div>
      </header>

      {/* Menú Lateral Deslizante */}
      <SideMenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onPickFiles={onPickFiles}
        onScanDirectory={onScanDirectory}
        isScanning={isScanning}
        totalComics={totalComics}
      />
    </>
  );
};
