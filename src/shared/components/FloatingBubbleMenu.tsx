import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  Library,
  BarChart2,
  Settings,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { useThemeStore } from '../../core/theme/useThemeStore';

export type AppTab = 'home' | 'library' | 'analytics' | 'settings';

interface FloatingBubbleMenuProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  totalComics: number;
  onPickFiles: () => void;
}

export const FloatingBubbleMenu: React.FC<FloatingBubbleMenuProps> = ({
  activeTab,
  onTabChange,
  totalComics,
  onPickFiles,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, toggleMode, primaryColor } = useThemeStore();

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'analytics', label: 'Análisis', icon: BarChart2 },
    { id: 'library', label: 'Biblioteca', icon: Library, badge: totalComics },
    { id: 'home', label: 'Inicio', icon: Home },
  ];

  return (
    <>
      {/* Telón de fondo traslúcido para enfocar las burbujas */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Contenedor flotante en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-5 sm:right-8 z-50 flex flex-col items-end gap-3 select-none">
        {/* Pila de burbujas flotantes cuando el menú está abierto */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-1 animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Burbuja de alternar Modo Claro / Oscuro */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-none pointer-events-none">
                {mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </span>
              <button
                type="button"
                onClick={() => {
                  toggleMode();
                  setIsOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/90 text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
                aria-label="Alternar modo visual"
              >
                {mode === 'dark' ? (
                  <Sun className="h-4 w-4 stroke-[2]" />
                ) : (
                  <Moon className="h-4 w-4 stroke-[2]" />
                )}
              </button>
            </div>

            {/* Burbuja de Agregar Cómics */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-none pointer-events-none">
                Agregar cómic
              </span>
              <button
                type="button"
                onClick={() => {
                  onPickFiles();
                  setIsOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/90 text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
                aria-label="Agregar cómics"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Burbujas de Navegación de Vistas */}
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  {/* Etiqueta flotante a la izquierda de la burbuja */}
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-none pointer-events-none">
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className="rounded-full px-1.5 py-0.2 text-[10px] font-bold text-white ml-0.5"
                        style={{ backgroundColor: primaryColor.hex }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {/* Burbuja circular interactiva */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer border ${
                      isActive
                        ? 'border-white/30 scale-105'
                        : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-white/10'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor.hex, color: 'var(--btn-text)' } : undefined}
                    aria-label={`Ir a ${item.label}`}
                  >
                    <IconComponent className="h-5 w-5 stroke-[2]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón Flotante Principal (Disparador de Burbujas) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-none hover:scale-105 active:scale-90 transition-all cursor-pointer"
          style={{ backgroundColor: primaryColor.hex, color: 'var(--btn-text)' }}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5] transition-transform duration-200 rotate-90 animate-in spin-in-90" style={{ color: 'var(--btn-text)' }} />
          ) : (
            <Menu className="h-6 w-6 stroke-[2.5] transition-transform duration-200" style={{ color: 'var(--btn-text)' }} />
          )}
        </button>
      </div>
    </>
  );
};
