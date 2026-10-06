import React, { useState, useRef } from 'react';
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
  isHudVisible?: boolean;
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
  isHudVisible = false,
  onNextPage,
  onPrevPage,
  onToggleHud,
}) => {
  const isRtl = readingMode === 'rtl';
  const isDouble = pageSpread === 'double' && Boolean(secondPageUrl);

  // Estado para la animación 3D de paso de página (Efecto Hoja)
  const [flipAnimation, setFlipAnimation] = useState<'next' | 'prev' | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const triggerNext = () => {
    if (flipAnimation) return;
    setFlipAnimation(isRtl ? 'prev' : 'next');
    setTimeout(() => {
      onNextPage();
      setFlipAnimation(null);
    }, 260);
  };

  const triggerPrev = () => {
    if (flipAnimation) return;
    setFlipAnimation(isRtl ? 'next' : 'prev');
    setTimeout(() => {
      onPrevPage();
      setFlipAnimation(null);
    }, 260);
  };

  // Navegación por toques en zonas tipo Huawei Books
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // Si hay zoom activo notable, permitir interacción táctil sin cambiar página
    if (zoom > 1.15) {
      return;
    }

    // Si el menú HUD está visible, un toque en cualquier parte de la pantalla lo oculta
    if (isHudVisible) {
      onToggleHud();
      return;
    }

    const clientX = e.clientX;
    const screenWidth = window.innerWidth;

    // Zona izquierda (30%): página anterior (o siguiente en manga RTL)
    // Zona derecha (30%): página siguiente (o anterior en manga RTL)
    // Zona central (40%): abrir menú HUD
    const isLeftSide = clientX < screenWidth * 0.3;
    const isRightSide = clientX > screenWidth * 0.7;

    if (isLeftSide) {
      if (isRtl) {
        triggerNext();
      } else {
        triggerPrev();
      }
    } else if (isRightSide) {
      if (isRtl) {
        triggerPrev();
      } else {
        triggerNext();
      }
    } else {
      // Toque central: alternar HUD
      onToggleHud();
    }
  };

  // Detección de gestos táctiles directos (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1.15) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom > 1.15 || touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Desplazamiento horizontal significativo
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Deslizar a la izquierda -> siguiente
        if (isRtl) triggerPrev();
        else triggerNext();
      } else {
        // Deslizar a la derecha -> anterior
        if (isRtl) triggerNext();
        else triggerPrev();
      }
    }
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
    <div
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black select-none touch-none cursor-pointer"
      aria-label="Lienzo de lectura (toques laterales pasan página, centro abre menú)"
    >
      {/* Escenario de lectura con transiciones fluidas */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className={`flex h-full w-full items-center justify-center transition-transform duration-75 ease-out page-anim-container ${
            flipAnimation === 'next'
              ? 'page-slide-next-exit'
              : flipAnimation === 'prev'
              ? 'page-slide-prev-exit'
              : ''
          }`}
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

      {/* Indicador sutil de pliego en la esquina inferior */}
      {isDouble && !isHudVisible && (
        <div className="pointer-events-none absolute bottom-3 left-4 z-20 font-mono text-[10px] text-zinc-500 bg-black/60 px-2 py-0.5 rounded-sm">
          Páginas {Math.min(leftPageIndex, rightPageIndex) + 1} - {Math.max(leftPageIndex, rightPageIndex) + 1} / {totalPages}
        </div>
      )}
    </div>
  );
};
