import React from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import type { ReadingMode, FitMode } from '../types/readerTypes';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface ReaderHUDProps {
  title: string;
  currentPageIndex: number;
  totalPages: number;
  readingMode: ReadingMode;
  fitMode: FitMode;
  isHudVisible: boolean;
  isFullscreen: boolean;
  zoom: number;
  onClose: () => void;
  onPageChange: (index: number) => void;
  onReadingModeChange: (mode: ReadingMode) => void;
  onFitModeChange: (fit: FitMode) => void;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ReaderHUD: React.FC<ReaderHUDProps> = ({
  title,
  currentPageIndex,
  totalPages,
  readingMode,
  fitMode,
  isHudVisible,
  isFullscreen,
  zoom,
  onClose,
  onPageChange,
  onReadingModeChange,
  onFitModeChange,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { primaryColor } = useThemeStore();

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 flex flex-col justify-between transition-opacity duration-300 ${
        isHudVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Barra Superior sin bordes */}
      <div className={`pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md transition-transform duration-300 ${
        isHudVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Cerrar lector"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2]" />
          </button>
          <div className="flex flex-col max-w-[200px] sm:max-w-md">
            <h2 className="line-clamp-1 text-xs sm:text-sm font-semibold text-white m-0">
              {title}
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">
              Página {currentPageIndex + 1} de {totalPages}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de pantalla completa */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 stroke-[2]" />
            ) : (
              <Maximize2 className="h-4 w-4 stroke-[2]" />
            )}
          </button>
        </div>
      </div>

      {/* Barra Inferior sin bordes */}
      <div className={`pointer-events-auto flex flex-col gap-3 px-4 sm:px-8 py-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-md transition-transform duration-300 ${
        isHudVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Slider de navegación de páginas (Scrubber) con acento primario dinámico */}
        <div className="flex items-center gap-3 w-full max-w-2xl mx-auto">
          <span className="text-xs font-mono text-zinc-400 w-8 text-right">
            {currentPageIndex + 1}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalPages - 1)}
            value={currentPageIndex}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700/80 focus:outline-none transition-all"
            style={{
              accentColor: primaryColor.hex,
            }}
            aria-label="Deslizador de páginas"
          />
          <span className="text-xs font-mono text-zinc-400 w-8">
            {totalPages}
          </span>
        </div>

        {/* Controles de Modos y Zoom sin bordes */}
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto w-full pt-1">
          {/* Selector de modo de lectura */}
          <div className="flex items-center gap-1 rounded-full bg-zinc-900/90 p-1 backdrop-blur-md shadow-md">
            <button
              type="button"
              onClick={() => onReadingModeChange('ltr')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'ltr'
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'ltr' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Occidental (LTR)
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('rtl')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'rtl'
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'rtl' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Manga (RTL)
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('webtoon')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'webtoon'
                  ? 'text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'webtoon' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Webtoon
            </button>
          </div>

          {/* Ajuste de escala / Fit sin bordes */}
          {readingMode !== 'webtoon' && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-zinc-900/90 p-1 backdrop-blur-md shadow-md">
              <button
                type="button"
                onClick={() => onFitModeChange('contain')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'contain'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ajustar pantalla
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('width')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'width'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ajustar ancho
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('height')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'height'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ajustar alto
              </button>
            </div>
          )}

          {/* Controles de Zoom sin bordes */}
          <div className="flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-1 backdrop-blur-md shadow-md">
            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoom <= 1}
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
              aria-label="Alejar"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-10 text-center font-mono text-[10px] text-zinc-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoom >= 4}
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
              aria-label="Acercar"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={onResetZoom}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                aria-label="Restablecer zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

