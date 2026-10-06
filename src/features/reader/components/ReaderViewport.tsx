import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useReader } from '../hooks/useReader';
import { useReaderGestures } from '../hooks/useReaderGestures';
import { PagedView } from './PagedView';
import { WebtoonView } from './WebtoonView';
import { ReaderHUD } from './ReaderHUD';

interface ReaderViewportProps {
  comic: StoredComic;
  onClose: () => void;
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({
  comic,
  onClose,
}) => {
  const {
    currentPageIndex,
    totalPages,
    readingMode,
    fitMode,
    isHudVisible,
    isFullscreen,
    currentPageUrl,
    isLoadingPage,
    zoom,
    pan,
    setZoom,
    setPan,
    setReadingMode,
    setFitMode,
    toggleHud,
    toggleFullscreen,
    nextPage,
    prevPage,
    goToPage,
    resetZoom,
  } = useReader({ comic, onClose });

  const isSnapMode = true;

  const handleSwipeLeft = () => {
    if (readingMode === 'rtl') {
      prevPage();
    } else {
      nextPage();
    }
  };

  const handleSwipeRight = () => {
    if (readingMode === 'rtl') {
      nextPage();
    } else {
      prevPage();
    }
  };

  const handleDoubleTap = () => {
    if (zoom === 1) {
      setZoom(2.2);
    } else {
      resetZoom();
    }
  };

  const { containerRef } = useReaderGestures({
    zoom,
    pan,
    setZoom,
    setPan,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onDoubleTap: handleDoubleTap,
  });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, prev - 0.25);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* Botones flotantes de acceso permanente garantizado cuando el HUD está oculto */}
      {!isHudVisible && (
        <>
          {/* Botón flotante superior izquierdo: Salir del lector */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md hover:bg-black/90 hover:text-white active:scale-95 transition-all cursor-pointer border border-white/15"
            aria-label="Cerrar y volver a la biblioteca"
            title="Volver"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Botón flotante superior derecho: Mostrar menú y opciones */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHud();
            }}
            className="fixed top-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md hover:bg-black/90 hover:text-white active:scale-95 transition-all cursor-pointer border border-white/15"
            aria-label="Mostrar controles y opciones del lector"
            title="Opciones"
          >
            <Menu className="h-5 w-5 stroke-[2]" />
          </button>
        </>
      )}

      {/* Vista de Lectura según el Modo */}
      {readingMode === 'webtoon' ? (
        <WebtoonView
          comicId={comic.id}
          totalPages={totalPages}
          initialPageIndex={currentPageIndex}
          onPageChange={goToPage}
          onToggleHud={toggleHud}
          isSnapMode={isSnapMode}
        />
      ) : (
        <PagedView
          pageUrl={currentPageUrl}
          isLoading={isLoadingPage}
          pageIndex={currentPageIndex}
          readingMode={readingMode}
          fitMode={fitMode}
          zoom={zoom}
          pan={pan}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onToggleHud={toggleHud}
        />
      )}

      {/* Controles de la Interfaz HUD */}
      <ReaderHUD
        title={comic.title}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        readingMode={readingMode}
        fitMode={fitMode}
        isHudVisible={isHudVisible}
        isFullscreen={isFullscreen}
        zoom={zoom}
        onClose={onClose}
        onPageChange={goToPage}
        onReadingModeChange={setReadingMode}
        onFitModeChange={setFitMode}
        onToggleFullscreen={toggleFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={resetZoom}
      />
    </div>
  );
};
