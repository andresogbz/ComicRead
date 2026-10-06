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
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
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
  bookmarks?: number[];
  nextComic?: StoredComic | null;
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
  onToggleBookmark?: () => void;
  onOpenNextComic?: (comic: StoredComic) => void;
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
  bookmarks = [],
  nextComic = null,
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
  onToggleBookmark,
  onOpenNextComic,
  onToggleFilmstrip,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { primaryColor } = useThemeStore();
  const [showLightingMenu, setShowLightingMenu] = useState(false);
  const [showBookmarksMenu, setShowBookmarksMenu] = useState(false);

  const isCurrentPageBookmarked = bookmarks.includes(currentPageIndex);

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
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
        }}
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
          <div className="flex flex-col max-w-[180px] sm:max-w-md">
            <h2 className="line-clamp-1 text-xs sm:text-sm font-semibold text-white m-0">
              {title}
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">
              Página {currentPageIndex + 1} de {totalPages}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Marcador para la página actual */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`flex h-9 w-9 items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer ${
                isCurrentPageBookmarked
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
              }`}
              aria-label={isCurrentPageBookmarked ? 'Quitar marcador' : 'Guardar marcador en esta página'}
              title={isCurrentPageBookmarked ? 'Marcador guardado' : 'Guardar marcador'}
            >
              <Bookmark
                className={`h-4 w-4 stroke-[2] ${
                  isCurrentPageBookmarked ? 'fill-amber-400' : ''
                }`}
              />
            </button>
          )}

          {/* Menú de lista de marcadores si existen */}
          {bookmarks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowBookmarksMenu((prev) => !prev);
                setShowLightingMenu(false);
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showBookmarksMenu
                  ? 'bg-amber-400/20 text-amber-300 font-semibold'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{bookmarks.length}</span>
            </button>
          )}

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
            onClick={() => {
              setShowLightingMenu((prev) => !prev);
              setShowBookmarksMenu(false);
            }}
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

      {/* Menú de Lista de Marcadores Guardados */}
      {showBookmarksMenu && bookmarks.length > 0 && (
        <div className="pointer-events-auto mx-auto w-[92%] sm:w-72 bg-black/95 border border-zinc-800 py-3 px-4 text-xs select-none self-end sm:mr-6 mb-2">
          <div className="flex items-center justify-between text-zinc-300 font-medium mb-2.5 pb-1 border-b border-zinc-900">
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Marcadores guardados
            </span>
            <span className="font-mono text-[10px] text-zinc-500">{bookmarks.length}</span>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {bookmarks.map((pIndex) => (
              <button
                key={pIndex}
                type="button"
                onClick={() => {
                  onPageChange(pIndex);
                  setShowBookmarksMenu(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm text-left transition-colors cursor-pointer ${
                  pIndex === currentPageIndex
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>Página {pIndex + 1}</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {pIndex === currentPageIndex ? 'Actual' : 'Ir'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menú Flotante de Iluminación Nocturna */}
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
              className={`flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                colorFilter === 'none' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'none' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => onColorFilterChange('warm')}
              className={`flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                colorFilter === 'warm' ? 'text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'warm' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Cálido
            </button>
            <button
              type="button"
              onClick={() => onColorFilterChange('sepia')}
              className={`flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                colorFilter === 'sepia' ? 'text-yellow-600' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={colorFilter === 'sepia' ? { borderBottom: `2px solid ${primaryColor.hex}` } : undefined}
            >
              Sepia
            </button>
          </div>
        </div>
      )}

      {/* Banner discreto para Continuación Automática al llegar a la última página */}
      {currentPageIndex === totalPages - 1 && nextComic && onOpenNextComic && (
        <div className="pointer-events-auto mx-auto w-[94%] sm:w-auto sm:max-w-xl bg-black/95 border border-zinc-800 px-4 py-3 flex items-center justify-between gap-3 text-xs mb-2 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="h-4 w-4 shrink-0 text-zinc-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase font-medium">Fin del tomo actual</span>
              <span className="text-white font-medium truncate">{nextComic.title}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenNextComic(nextComic)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer active:scale-95 transition-all shrink-0"
            style={{ backgroundColor: primaryColor.hex }}
          >
            <span>Continuar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tira de Miniaturas desplegable en la parte inferior */}
      <ThumbnailFilmstrip
        comicId={comicId}
        totalPages={totalPages}
        currentPageIndex={currentPageIndex}
        bookmarks={bookmarks}
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
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                readingMode === 'ltr' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'ltr' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Occidental
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('rtl')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                readingMode === 'rtl' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              style={readingMode === 'rtl' ? { backgroundColor: primaryColor.hex } : undefined}
            >
              Manga (RTL)
            </button>
            <button
              type="button"
              onClick={() => onReadingModeChange('webtoon')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
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
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${
                  pageSpread === 'single' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Página individual"
              >
                1 pág
              </button>
              <button
                type="button"
                onClick={() => onPageSpreadChange('double')}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer ${
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
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all cursor-pointer ${
                  fitMode === 'contain' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pantalla
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('width')}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all cursor-pointer ${
                  fitMode === 'width' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ancho
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('height')}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all cursor-pointer ${
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
