import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  FolderSearch,
} from 'lucide-react';
import { useThemeStore } from '../../core/theme/useThemeStore';

export type AppTab = 'home' | 'library' | 'analytics' | 'settings';

interface FloatingBubbleMenuProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  totalComics: number;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  isScanning: boolean;
}

export const FloatingBubbleMenu: React.FC<FloatingBubbleMenuProps> = ({
  activeTab,
  onTabChange,
  totalComics,
  onPickFiles,
  onScanDirectory,
  isScanning,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { primaryColor } = useThemeStore();

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const menuItems = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      action: () => onTabChange('settings'),
      isActive: activeTab === 'settings',
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: BarChart3,
      action: () => onTabChange('analytics'),
      isActive: activeTab === 'analytics',
    },
    {
      id: 'library',
      label: 'Biblioteca',
      icon: BookOpen,
      action: () => onTabChange('library'),
      badge: totalComics > 0 ? totalComics : undefined,
      isActive: activeTab === 'library',
    },
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      action: () => onTabChange('home'),
      isActive: activeTab === 'home',
    },
    {
      id: 'scan',
      label: isScanning ? 'Escaneando...' : 'Escanear carpeta',
      icon: FolderSearch,
      action: onScanDirectory,
      disabled: isScanning,
      isAction: true,
    },
    {
      id: 'add',
      label: 'Agregar cómic',
      icon: Plus,
      action: onPickFiles,
      isAction: true,
      highlight: true,
    },
  ];

  return (
    <>
      {/* Telón de fondo cuando el menú de burbujas está abierto */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Contenedor flotante en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 select-none">
        {/* Burbujas desplegables hacia arriba */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-1 animate-in slide-in-from-bottom-5 fade-in duration-200">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.disabled) return;
                    item.action();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {/* Etiqueta de texto a la izquierda de la burbuja */}
                  <span className="rounded-full bg-black/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/10 shadow-lg transition-transform group-hover:scale-105">
                    {item.label}
                  </span>

                  {/* Burbuja circular */}
                  <button
                    type="button"
                    disabled={item.disabled}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-150 active:scale-95 group-hover:scale-105 cursor-pointer ${
                      item.isActive
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                        : ''
                    } ${item.disabled ? 'opacity-50' : ''}`}
                    style={{
                      backgroundColor: item.highlight
                        ? primaryColor.hex
                        : item.isActive
                        ? primaryColor.hex
                        : '#18181b',
                    }}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5 stroke-[2]" />

                    {typeof item.badge === 'number' && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón flotante principal (FAB) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer"
          style={{ backgroundColor: primaryColor.hex }}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5] transition-transform duration-200 rotate-90" />
          ) : (
            <Menu className="h-6 w-6 stroke-[2.5]" />
          )}
        </button>
      </div>
    </>
  );
};
