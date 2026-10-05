import React from 'react';
import { BookOpen, FolderSearch, Plus, LayoutDashboard, Library } from 'lucide-react';
import { ThemeControls } from './ThemeControls';
import { useThemeStore } from '../../core/theme/useThemeStore';

export type AppTab = 'home' | 'library';

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

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg-main)] border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Marca y Navegación Principal */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
            aria-label="Ir a Inicio"
          >
            <BookOpen
              className="h-5 w-5 stroke-[2] transition-transform duration-150 group-hover:scale-105"
              style={{ color: primaryColor.hex }}
            />
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
              ComicRead
            </span>
          </button>

          {/* Pestañas de Navegación planas sin sombras */}
          <nav className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-900 p-1 transition-colors">
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 stroke-[2]" />
              <span>Inicio</span>
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
              <Library className="h-3.5 w-3.5 stroke-[2]" />
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
          </nav>
        </div>

        {/* Acciones y Controles de Tema */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeControls />

          {/* Botón de Escanear Carpeta plano sin sombras */}
          <button
            type="button"
            onClick={onScanDirectory}
            disabled={isScanning}
            className="hidden sm:flex h-9 items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            title="Escanear carpeta local"
          >
            <FolderSearch className="h-4 w-4 stroke-[1.75]" />
            <span>{isScanning ? 'Escaneando...' : 'Escanear'}</span>
          </button>

          {/* Botón de Importar Cómics plano sin sombras */}
          <button
            type="button"
            onClick={onPickFiles}
            className="flex h-9 items-center gap-1.5 rounded-full px-3.5 sm:px-4 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: primaryColor.hex,
            }}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Abrir cómic(s)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
