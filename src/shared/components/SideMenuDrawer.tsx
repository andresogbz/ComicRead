import React, { useEffect } from 'react';
import { X, Sun, Moon, FolderSearch, Plus } from 'lucide-react';
import { useThemeStore, PRIMARY_COLORS } from '../../core/theme/useThemeStore';

export type AppTab = 'home' | 'library' | 'analytics' | 'settings';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  isScanning: boolean;
  totalComics: number;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onPickFiles,
  onScanDirectory,
  isScanning,
  totalComics,
}) => {
  const { mode, toggleMode, primaryColor, setPrimaryColor } = useThemeStore();

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const NAV_ITEMS: { id: AppTab; label: string; badge?: number }[] = [
    { id: 'home', label: 'Inicio' },
    { id: 'library', label: 'Biblioteca', badge: totalComics },
    { id: 'analytics', label: 'Análisis' },
    { id: 'settings', label: 'Configuración' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Telón de fondo */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Panel lateral deslizante (diseño idéntico a la segunda imagen de referencia) */}
      <aside
        className="relative z-10 h-full w-72 sm:w-84 max-w-[85vw] bg-zinc-950/95 text-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-250 border-r border-zinc-800/80 shadow-none backdrop-blur-md"
        aria-label="Menú de navegación"
      >
        <div>
          {/* Fila superior: Logo y Botón de Cierre plano sin fondos */}
          <div className="flex items-center justify-between pb-6">
            <span className="font-bold text-2xl tracking-tight text-white">
              OGMIC
            </span>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center text-white hover:opacity-60 active:scale-90 transition-transform cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6 stroke-[2]" />
            </button>
          </div>

          {/* Divisor con etiqueta: — Menú */}
          <div className="flex items-center gap-2.5 my-4">
            <div className="w-5 h-[1.5px] bg-zinc-700" />
            <span className="text-xs text-zinc-400 font-medium">
              Menú
            </span>
          </div>

          {/* Enlaces Principales en Tipografía Normal en Negrita (Sentence case) */}
          <nav className="flex flex-col gap-2 py-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className="flex items-center justify-between text-left py-2 text-2xl sm:text-3xl font-bold tracking-tight transition-all duration-150 cursor-pointer group"
                >
                  <span
                    className={
                      isActive
                        ? 'text-white underline underline-offset-8 decoration-2'
                        : 'text-zinc-500 hover:text-white'
                    }
                    style={isActive ? { textDecorationColor: primaryColor.hex } : undefined}
                  >
                    {item.label}
                  </span>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white ml-2"
                      style={{ backgroundColor: primaryColor.hex }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divisor con etiqueta: — Ajustes rápidos */}
          <div className="flex items-center gap-2.5 my-5">
            <div className="w-5 h-[1.5px] bg-zinc-700" />
            <span className="text-xs text-zinc-400 font-medium">
              Ajustes rápidos
            </span>
          </div>

          {/* Alternar Modo Claro / Oscuro (icono plano sin fondo) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMode}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white py-1 transition-colors cursor-pointer"
            >
              {mode === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 stroke-[2]" />
                  <span>Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 stroke-[2]" />
                  <span>Modo oscuro</span>
                </>
              )}
            </button>
          </div>

          {/* Círculos de color de acento sin fondos adicionales */}
          <div className="flex items-center gap-2 mt-3">
            {PRIMARY_COLORS.map((col) => {
              const isSelected = col.id === primaryColor.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setPrimaryColor(col)}
                  className={`h-5 w-5 rounded-full transition-transform active:scale-95 cursor-pointer ${
                    isSelected ? 'ring-2 ring-offset-2 ring-zinc-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                  aria-label={`Seleccionar color ${col.name}`}
                />
              );
            })}
          </div>

          {/* Divisor con etiqueta: — Acciones */}
          <div className="flex items-center gap-2.5 my-5">
            <div className="w-5 h-[1.5px] bg-zinc-700" />
            <span className="text-xs text-zinc-400 font-medium">
              Acciones
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onPickFiles();
                onClose();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer text-left"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Agregar cómics</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onScanDirectory();
                onClose();
              }}
              disabled={isScanning}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <FolderSearch className="h-4 w-4 stroke-[2]" />
              <span>{isScanning ? 'Escaneando...' : 'Escanear carpeta'}</span>
            </button>
          </div>
        </div>

        {/* Pie de Drawer */}
        <div className="pt-6 border-t border-zinc-800/80 text-[11px] text-zinc-500">
          <span>OGMIC v1.0.6</span>
        </div>
      </aside>
    </div>
  );
};
