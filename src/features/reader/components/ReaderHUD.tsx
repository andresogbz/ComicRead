import React, { useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Moon,
  BookOpen,
} from 'lucide-react';
import type { ReadingMode, FitMode, PageSpread, ColorFilter } from '../types/readerTypes';
import { useThemeStore } from '../../../core/theme/useThemeStore';
import { ThumbnailFilmstrip } from './ThumbnailFilmstrip';

interface ReaderHUDProps {
  title: string;
  currentPageIndex: number;
  totalPages: number;
  readingMode: ReadingMode;
  fitMode: FitMode;
  pageSpread: PageSpread;
  brightness: number;
  colorFilter: ColorFilter;
  isHudVisible: boolean;
  isFilmstripOpen: boolean;
  isFullscreen: boolean;
  zoom: number;
  comicId: string;
  onClose: () => void;
  onPageChange: (index: number) => void;
  onReadingModeChange: (mode: ReadingMode) => void;
  onFitModeChange: (fit: FitMode) => void;
  onPageSpreadChange: (spread: PageSpread) => void;
  onBrightnessChange: (val: number) => void;
  onColorFilterChange: (filter: ColorFilter) => void;
  onToggleFilmstrip: () => void;
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
  pageSpread,
  brightness,
  colorFilter,
  isHudVisible,
  isFilmstripOpen,
  isFullscreen,
  zoom,
  comicId,
  onClose,
  onPageChange,
  onReadingModeChange,
  onFitModeChange,
  onPageSpreadChange,
  onBrightnessChange,
  onColorFilterChange,
  onToggleFilmstrip,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { primaryColor } = useThemeStore();
  const [showLightingMenu, setShowLightingMenu] = useState(false);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 flex flex-col justify-between transition-opacity duration-300 ${
        isHudVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Barra Superior plana sin sombras */}
      <div
        className={`pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/90 border-b border-zinc-900 transition-transform duration-200 ${
          isHudVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
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
          {/* Botón de tira de miniaturas rápida */}
          <button
            type="button"
            onClick={onToggleFilmstrip}
            className={`flex h-9 w-9 items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer ${
              isFilmstripOpen ? 'text-white' : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
            style={isFilmstripOpen ? { backgroundColor: primaryColor.hex } : undefined}
            aria-label={isFilmstripOpen ? 'Ocultar miniaturas' : 'Mostrar miniaturas'}
            title="Miniaturas de páginas"
          >
            <Layers className="h-4 w-4 stroke-[2]" />
          </button>

          {/* Botón de atenuador nocturno y filtros */}
          <button
            type="button"
            onClick={() => setShowLightingMenu((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer ${
              showLightingMenu || brightness < 100 || colorFilter !== 'none'
                ? 'text-white'
                : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
            style={
              showLightingMenu || brightness < 100 || colorFilter !== 'none'
                ? { backgroundColor: primaryColor.hex }
                : undefined
            }
            aria-label="Atenuador nocturno y tonos"
            title="Atenuador nocturno"
          >
            <Moon className="h-4 w-4 stroke-[2]" />
          </button>

          {/* Alternador de pantalla completa */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
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

      {/* Menú Flotante de Iluminación Nocturna (si está abierto) */}
      {showLightingMenu && (
        <div className="pointer-events-auto mx-auto w-[92%] sm:w-80 bg-black/95 border border-zinc-800 py-3 px-4 text-xs select-none self-end sm:mr-6 mb-2">
          <div className="flex items-center justify-between text-zinc-300 font-medium mb-3">
            <span>Iluminación nocturna</span>
            <span className="font-mono text-[10px] text-zinc-500">{brightness}%</span>
          </div>

          {/* Deslizador de brillo */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-zinc-500">20%</span>
            <input
              type="range"
              min={20}
              max={100}
              value={brightness}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800"
              style={{ accentColor: primaryColor.hex }}
              aria-label="Nivel de atenuación"
            />
            <span className="text-[10px] text-zinc-500">100%</span>
          </div>

          {/* Filtros de tono / temperatura */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-900">
            <button
              type="button"
              onClick={() => onColorFilterChange('none')}
              className={`flex-1 py-1 text-[10px] font-medium transition-colors ${
                colorFilter === 'none' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'none' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => onColorFilterChange('warm')}
              className={`flex-1 py-1 text-[10px] font-medium transition-colors ${
                colorFilter === 'warm' ? 'text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'warm' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Cálido
            </button>
            <button
              type="button"
              onClick={() => onColorFilterChange('sepia')}
              className={`flex-1 py-1 text-[10px] font-medium transition-colors ${
                colorFilter === 'sepia' ? 'text-yellow-600' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'sepia' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Sepia
            </button>
          </div>
        </div>
      )}

      {/* Tira de Miniaturas desplegable en la parte inferior */}
      <ThumbnailFilmstrip
        comicId={comicId}
        totalPages={totalPages}
        currentPageIndex={currentPageIndex}
        isOpen={isFilmstripOpen}
        onSelectPage={onPageChange}
      />

      {/* Barra Inferior plana sin sombras */}
      <div
        className={`pointer-events-auto flex flex-col gap-3 px-4 sm:px-8 py-3.5 bg-black/95 border-t border-zinc-900 transition-transform duration-200 ${
          isHudVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Slider de navegación de páginas (Scrubber) */}
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
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 focus:outline-none transition-all"
            style={{
              accentColor: primaryColor.hex,
            }}
            aria-label="Deslizador de páginas"
          />
          <span className="text-xs font-mono text-zinc-400 w-8">
            {totalPages}
          </span>
        </div>

        {/* Fila de Controles: Modo de lectura, Pliego, Fit y Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 max-w-4xl mx-auto w-full pt-1">
          {/* Selector de modo de lectura */}
          <div className="flex items-center gap-1 rounded-full bg-zinc-900 p-0.5">
            <button
              type="button"
              onClick={() => onReadingModeChange('ltr')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'ltr' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'ltr' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Occidental
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('rtl')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'rtl' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'rtl' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Manga (RTL)
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('webtoon')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                readingMode === 'webtoon' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'webtoon' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Webtoon
            </button>
          </div>

          {/* Selector de Pliego (Página simple vs Doble página en horizontal) */}
          {readingMode !== 'webtoon' && (
            <div className="flex items-center gap-1 rounded-full bg-zinc-900 p-0.5">
              <button
                type="button"
                onClick={() => onPageSpreadChange('single')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  pageSpread === 'single' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Página individual"
              >
                1 pág
              </button>
              <button
                type="button"
                onClick={() => onPageSpreadChange('double')}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  pageSpread === 'double' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Doble página contigua"
              >
                <BookOpen className="h-3 w-3" />
                <span>2 págs</span>
              </button>
            </div>
          )}

          {/* Ajuste de escala (Fit) */}
          {readingMode !== 'webtoon' && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-zinc-900 p-0.5">
              <button
                type="button"
                onClick={() => onFitModeChange('contain')}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'contain' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pantalla
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('width')}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'width' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ancho
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('height')}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
                  fitMode === 'height' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Alto
              </button>
            </div>
          )}

          {/* Controles de Zoom */}
          <div className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5">
            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoom <= 1}
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              aria-label="Alejar"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-8 text-center font-mono text-[10px] text-zinc-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoom >= 4}
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              aria-label="Acercar"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={onResetZoom}
                className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
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
