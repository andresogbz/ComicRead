import React from 'react';
import { X, Minus, Plus, Scroll, Book } from 'lucide-react';
import {
  type BookPreferences,
  type BookTheme,
  type BookFontFamily,
  BOOK_THEMES,
} from '../types/book';

interface BookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: BookPreferences;
  onUpdatePreferences: (updates: Partial<BookPreferences>) => void;
}

export const BookSettingsModal: React.FC<BookSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const themes: BookTheme[] = ['sepia', 'crema', 'white', 'slate', 'oled'];
  const fonts: { id: BookFontFamily; label: string }[] = [
    { id: 'serif', label: 'Literata (Serif)' },
    { id: 'sans', label: 'Moderna (Sans)' },
    { id: 'mono', label: 'Monospaciada' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-950 text-zinc-100 flex flex-col border-t sm:border-b border-zinc-800 pb-6 sm:pb-4">
        {/* Encabezado plano */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100 m-0">
            Ajustes de lectura
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar ajustes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4 overflow-y-auto max-h-[75vh]">
          {/* 1. Temas de color (Google Play Books / Kindle) */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium text-zinc-400">Tema de fondo</span>
            <div className="grid grid-cols-5 gap-2">
              {themes.map((th) => {
                const conf = BOOK_THEMES[th];
                const isActive = preferences.theme === th;

                return (
                  <button
                    key={th}
                    type="button"
                    onClick={() => onUpdatePreferences({ theme: th })}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-sm transition-all cursor-pointer ${
                      isActive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: conf.bg, color: conf.text }}
                  >
                    <span className="text-xs font-serif font-bold">Aa</span>
                    <span className="text-[9px] mt-1 font-sans truncate max-w-full">
                      {conf.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tipografía */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400">Familia tipográfica</span>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((f) => {
                const isActive = preferences.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ fontFamily: f.id })}
                    className={`py-2 px-2 text-xs transition-colors cursor-pointer text-center ${
                      isActive
                        ? 'bg-zinc-800 text-amber-400 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                    style={{
                      fontFamily:
                        f.id === 'serif'
                          ? 'Georgia, serif'
                          : f.id === 'mono'
                          ? 'monospace'
                          : 'sans-serif',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tamaño de fuente */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-zinc-400">Tamaño de fuente</span>
              <span className="text-xs text-zinc-300 font-mono">{preferences.fontSize} px</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    fontSize: Math.max(14, preferences.fontSize - 1),
                  })
                }
                disabled={preferences.fontSize <= 14}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Disminuir tamaño"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    fontSize: Math.min(32, preferences.fontSize + 1),
                  })
                }
                disabled={preferences.fontSize >= 32}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Aumentar tamaño"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 4. Interlineado */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-zinc-400">Interlineado</span>
              <span className="text-xs text-zinc-300 font-mono">{preferences.lineHeight}x</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1.4, 1.7, 2.0].map((lh) => (
                <button
                  key={lh}
                  type="button"
                  onClick={() => onUpdatePreferences({ lineHeight: lh })}
                  className={`px-3 py-1 text-xs transition-colors cursor-pointer ${
                    preferences.lineHeight === lh
                      ? 'bg-zinc-800 text-amber-400 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lh === 1.4 ? 'Compacto' : lh === 1.7 ? 'Normal' : 'Amplio'}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Márgenes de lectura */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400">Márgenes</span>
            <div className="flex items-center gap-1.5">
              {(['compact', 'normal', 'wide'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onUpdatePreferences({ marginSize: m })}
                  className={`px-3 py-1 text-xs transition-colors cursor-pointer ${
                    preferences.marginSize === m
                      ? 'bg-zinc-800 text-amber-400 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m === 'compact' ? 'Estrecho' : m === 'normal' ? 'Medio' : 'Ancho'}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Modo de lectura */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400">Modo de lectura</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdatePreferences({ readingMode: 'paged' })}
                className={`flex items-center gap-1 px-3 py-1 text-xs transition-colors cursor-pointer ${
                  preferences.readingMode === 'paged'
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Book className="h-3 w-3" />
                <span>Paginado</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ readingMode: 'scroll' })}
                className={`flex items-center gap-1 px-3 py-1 text-xs transition-colors cursor-pointer ${
                  preferences.readingMode === 'scroll'
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Scroll className="h-3 w-3" />
                <span>Continuo</span>
              </button>
            </div>
          </div>

          {/* 7. Columnas de lectura */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-zinc-400">Columnas</span>
              <span className="text-[10px] text-zinc-500">
                {(preferences.columnCount ?? 1) === 2 ? '2 columnas' : '1 columna'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdatePreferences({ columnCount: 1 })}
                className={`px-3 py-1 text-xs transition-colors cursor-pointer ${
                  (preferences.columnCount ?? 1) === 1
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1 Columna
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ columnCount: 2 })}
                className={`px-3 py-1 text-xs transition-colors cursor-pointer ${
                  preferences.columnCount === 2
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2 Columnas
              </button>
            </div>
          </div>

          {/* 8. Animación de página (solo en modo paginado) */}
          {preferences.readingMode === 'paged' && (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-zinc-400">Paso de página</span>
                <span className="text-[10px] text-zinc-500">
                  {preferences.pageTransition === 'fade'
                    ? 'Desvanecimiento suave'
                    : preferences.pageTransition === 'none'
                    ? 'Sin animación'
                    : 'Deslizamiento fluido'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ pageTransition: 'slide' })}
                  className={`px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    (preferences.pageTransition ?? 'slide') === 'slide'
                      ? 'bg-zinc-800 text-amber-400 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Deslizar
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ pageTransition: 'fade' })}
                  className={`px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    preferences.pageTransition === 'fade'
                      ? 'bg-zinc-800 text-amber-400 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Disolver
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ pageTransition: 'none' })}
                  className={`px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                    preferences.pageTransition === 'none'
                      ? 'bg-zinc-800 text-amber-400 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Ninguna
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
