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
      <header className="sticky top-0 z-30 w-full max-w-full bg-[var(--bg-main)] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          {/* Botón de Menú Lateral y Logo OGMIC */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center text-zinc-900 dark:text-white hover:opacity-75 active:scale-95 transition-all cursor-pointer shrink-0"
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
              <span className="font-logo font-black text-xl sm:text-2xl tracking-tight text-zinc-900 dark:text-white transition-opacity group-hover:opacity-80">
                OGMIC
              </span>
            </button>

            {/* Pestañas de Navegación en Pantallas Medianas/Grandes */}
            <nav className="hidden md:flex items-center gap-1 ml-4 p-0.5 transition-colors">
              <button
                type="button"
                onClick={() => onTabChange('home')}
                className={`rounded-full px-3.5 py-1 text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                Inicio
              </button>

              <button
                type="button"
                onClick={() => onTabChange('library')}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                <span>Biblioteca</span>
                {totalComics > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.2 text-[10px] font-semibold text-white ml-0.5"
                    style={{ backgroundColor: primaryColor.hex }}
                  >
                    {totalComics}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTabChange('analytics')}
                className={`rounded-full px-3.5 py-1 text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                Análisis
              </button>

              <button
                type="button"
                onClick={() => onTabChange('settings')}
                className={`rounded-full px-3.5 py-1 text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                Configuración
              </button>
            </nav>
          </div>

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Botón de Importar Cómics responsivo */}
            <button
              type="button"
              onClick={onPickFiles}
              className="flex h-8 sm:h-9 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer shrink-0"
              style={{
                backgroundColor: primaryColor.hex,
              }}
              title="Abrir cómic"
              aria-label="Abrir cómic"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Agregar cómic</span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú Lateral Deslizante estilo imagen de referencia */}
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
