import React from 'react';
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
      {/* Vista de Lectura según el Modo */}
      {readingMode === 'webtoon' ? (
        <WebtoonView
          comicId={comic.id}
          totalPages={totalPages}
          initialPageIndex={currentPageIndex}
          onPageChange={goToPage}
          onToggleHud={toggleHud}
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
