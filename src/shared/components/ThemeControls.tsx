import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useThemeStore, PRIMARY_COLORS } from '../../core/theme/useThemeStore';

export const ThemeControls: React.FC = () => {
  const { mode, primaryColor, toggleMode, setPrimaryColor } = useThemeStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Botón de Modo Oscuro / Claro */}
      <button
        type="button"
        onClick={toggleMode}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
        aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {mode === 'dark' ? (
          <Sun className="h-4 w-4 stroke-[1.75]" />
        ) : (
          <Moon className="h-4 w-4 stroke-[1.75]" />
        )}
      </button>

      {/* Selector de Color Primario */}
      <div className="relative" ref={paletteRef}>
        <button
          type="button"
          onClick={() => setIsPaletteOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Elegir color primario"
        >
          <Palette
            className="h-4 w-4 stroke-[1.75]"
            style={{ color: primaryColor.hex }}
          />
        </button>

        {isPaletteOpen && (
          <div className="absolute right-0 top-11 z-50 flex flex-col gap-2 rounded-2xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-100 min-w-[190px]">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-1">
              Color de acento
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRIMARY_COLORS.map((col) => {
                const isSelected = col.id === primaryColor.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(col);
                      setIsPaletteOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 rounded-xl p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    title={col.name}
                  >
                    <div
                      className="relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium">
                      {col.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
