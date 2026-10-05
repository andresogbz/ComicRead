import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ReadingMode, FitMode } from '../types/readerTypes';

interface PagedViewProps {
  pageUrl: string | null;
  isLoading: boolean;
  pageIndex: number;
  readingMode: ReadingMode;
  fitMode: FitMode;
  zoom: number;
  pan: { x: number; y: number };
  onNextPage: () => void;
  onPrevPage: () => void;
  onToggleHud: () => void;
}

export const PagedView: React.FC<PagedViewProps> = ({
  pageUrl,
  isLoading,
  pageIndex,
  readingMode,
  fitMode,
  zoom,
  pan,
  onNextPage,
  onPrevPage,
  onToggleHud,
}) => {
  const isRtl = readingMode === 'rtl';

  const handleLeftTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) return;
    isRtl ? onNextPage() : onPrevPage();
  };

  const handleRightTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) return;
    isRtl ? onPrevPage() : onNextPage();
  };

  const handleCenterTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleHud();
  };

  const getFitClasses = () => {
    switch (fitMode) {
      case 'width':
        return 'w-full h-auto max-h-none';
      case 'height':
        return 'h-screen w-auto max-w-none';
      case 'contain':
      default:
        return 'max-h-screen max-w-full object-contain';
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black select-none touch-none">
      {/* Contenedor con zoom y desplazamiento aplicados */}
      <div
        className="flex h-full w-full items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {pageUrl ? (
          <img
            key={pageUrl}
            src={pageUrl}
            alt={`Página ${pageIndex + 1}`}
            className={`pointer-events-none select-none ${getFitClasses()}`}
            draggable={false}
          />
        ) : null}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        )}
      </div>

      {/* Zonas de toque táctil / click (sólo activas cuando zoom === 1 para no interferir con paneo) */}
      {zoom === 1 && (
        <div className="absolute inset-0 flex z-30">
          {/* Zona Izquierda (25%) */}
          <div
            onClick={handleLeftTap}
            className="h-full w-1/4 cursor-pointer hover:bg-white/[0.01]"
            aria-label={isRtl ? 'Página siguiente (Manga)' : 'Página anterior'}
          />

          {/* Zona Central (50%) */}
          <div
            onClick={handleCenterTap}
            className="h-full w-1/2 cursor-pointer"
            aria-label="Alternar controles HUD"
          />

          {/* Zona Derecha (25%) */}
          <div
            onClick={handleRightTap}
            className="h-full w-1/4 cursor-pointer hover:bg-white/[0.01]"
            aria-label={isRtl ? 'Página anterior (Manga)' : 'Página siguiente'}
          />
        </div>
      )}
    </div>
  );
};
