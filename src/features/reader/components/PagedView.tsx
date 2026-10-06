import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ReadingMode, FitMode, PageSpread, ColorFilter } from '../types/readerTypes';

interface PagedViewProps {
  pageUrl: string | null;
  secondPageUrl?: string | null;
  isLoading: boolean;
  pageIndex: number;
  totalPages: number;
  readingMode: ReadingMode;
  fitMode: FitMode;
  pageSpread?: PageSpread;
  brightness?: number;
  colorFilter?: ColorFilter;
  zoom: number;
  pan: { x: number; y: number };
  onNextPage: () => void;
  onPrevPage: () => void;
  onToggleHud: () => void;
}

export const PagedView: React.FC<PagedViewProps> = ({
  pageUrl,
  secondPageUrl,
  isLoading,
  pageIndex,
  totalPages,
  readingMode,
  fitMode,
  pageSpread = 'single',
  brightness = 100,
  colorFilter = 'none',
  zoom,
  pan,
  onNextPage,
  onPrevPage,
  onToggleHud,
}) => {
  const isRtl = readingMode === 'rtl';
  const isDouble = pageSpread === 'double' && Boolean(secondPageUrl);

  const handleLeftTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Si hay zoom activo, no cambiar página para permitir paneo libre
    if (zoom > 1.1) return;
    if (isRtl) {
      onNextPage();
    } else {
      onPrevPage();
    }
  };

  const handleRightTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Si hay zoom activo, no cambiar página para permitir paneo libre
    if (zoom > 1.1) return;
    if (isRtl) {
      onPrevPage();
    } else {
      onNextPage();
    }
  };

  const handleCenterTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleHud();
  };

  const getFitClasses = () => {
    switch (fitMode) {
      case 'width':
        return isDouble ? 'w-1/2 h-auto max-h-none' : 'w-full h-auto max-h-none';
      case 'height':
        return isDouble ? 'h-screen w-auto max-w-[50%]' : 'h-screen w-auto max-w-none';
      case 'contain':
      default:
        return isDouble
          ? 'max-h-screen max-w-[50vw] object-contain'
          : 'max-h-screen max-w-full object-contain';
    }
  };

  const getFilterStyle = (): string | undefined => {
    if (colorFilter === 'sepia') {
      return 'sepia(0.4) contrast(0.92)';
    }
    if (colorFilter === 'warm') {
      return 'sepia(0.18) hue-rotate(-10deg) saturate(1.15)';
    }
    return undefined;
  };

  // En modo doble:
  // LTR: Izquierda = N, Derecha = N + 1
  // RTL: Izquierda = N + 1, Derecha = N (orden de lectura manga japonés)
  const leftPageUrl = isDouble && isRtl ? secondPageUrl : pageUrl;
  const rightPageUrl = isDouble && isRtl ? pageUrl : secondPageUrl;

  const leftPageIndex = isDouble && isRtl ? pageIndex + 1 : pageIndex;
  const rightPageIndex = isDouble && isRtl ? pageIndex : pageIndex + 1;

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black select-none touch-none">
      {/* Contenedor de visualización con zoom y paneo */}
      <div
        className="flex h-full w-full items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: 'center center',
          filter: getFilterStyle(),
        }}
      >
        {isDouble ? (
          <div className="flex h-full w-full items-center justify-center">
            {/* Página izquierda del pliego */}
            {leftPageUrl && (
              <img
                key={leftPageUrl}
                src={leftPageUrl}
                alt={`Página ${leftPageIndex + 1}`}
                className={`pointer-events-none select-none ${getFitClasses()}`}
                draggable={false}
              />
            )}

            {/* Separador lineal sutil entre páginas */}
            <div className="w-[1px] h-3/4 bg-zinc-900/80 self-center shrink-0" />

            {/* Página derecha del pliego */}
            {rightPageUrl && (
              <img
                key={rightPageUrl}
                src={rightPageUrl}
                alt={`Página ${rightPageIndex + 1}`}
                className={`pointer-events-none select-none ${getFitClasses()}`}
                draggable={false}
              />
            )}
          </div>
        ) : (
          pageUrl && (
            <img
              key={pageUrl}
              src={pageUrl}
              alt={`Página ${pageIndex + 1}`}
              className={`pointer-events-none select-none ${getFitClasses()}`}
              draggable={false}
            />
          )
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        )}
      </div>

      {/* Atenuador nocturno (Screen Dimmer) integrado */}
      {brightness < 100 && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${(100 - brightness) * 0.0075})`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Zonas de toque táctil bien delimitadas */}
      <div className="absolute inset-0 flex z-30 pointer-events-auto">
        {/* Zona Izquierda (30%) */}
        <div
          onClick={handleLeftTap}
          className="h-full w-[30%] cursor-pointer hover:bg-white/[0.01]"
          aria-label={isRtl ? 'Página siguiente (Manga)' : 'Página anterior'}
        />

        {/* Zona Central (40%) - Alternar HUD garantizado */}
        <div
          onClick={handleCenterTap}
          className="h-full w-[40%] cursor-pointer hover:bg-white/[0.01]"
          aria-label="Alternar controles HUD"
        />

        {/* Zona Derecha (30%) */}
        <div
          onClick={handleRightTap}
          className="h-full w-[30%] cursor-pointer hover:bg-white/[0.01]"
          aria-label={isRtl ? 'Página anterior (Manga)' : 'Página siguiente'}
        />
      </div>

      {/* Indicador sutil de pliego en la esquina inferior */}
      {isDouble && (
        <div className="pointer-events-none absolute bottom-3 left-4 z-20 font-mono text-[10px] text-zinc-500 bg-black/60 px-2 py-0.5 rounded-sm">
          Páginas {Math.min(leftPageIndex, rightPageIndex) + 1} - {Math.max(leftPageIndex, rightPageIndex) + 1} / {totalPages}
        </div>
      )}
    </div>
  );
};
