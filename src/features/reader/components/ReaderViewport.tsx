import React, { useEffect } from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { statusBarService } from '../../../shared/services/statusBarService';
import { useReader } from '../hooks/useReader';
import { useReaderGestures } from '../hooks/useReaderGestures';
import { PagedView } from './PagedView';
import { WebtoonView } from './WebtoonView';
import { ReaderHUD } from './ReaderHUD';

interface ReaderViewportProps {
  comic: StoredComic;
  allComics?: StoredComic[];
  onClose: () => void;
  onOpenComic?: (comic: StoredComic) => void;
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({
  comic,
  allComics = [],
  onClose,
  onOpenComic,
}) => {
  const {
    currentPageIndex,
    totalPages,
    readingMode,
    fitMode,
    pageSpread,
    brightness,
    colorFilter,
    bookmarks,
    nextComic,
    isHudVisible,
    isFilmstripOpen,
    isFullscreen,
    currentPageUrl,
    secondPageUrl,
    isLoadingPage,
    zoom,
    pan,
    setZoom,
    setPan,
    setReadingMode,
    setFitMode,
    setPageSpread,
    setBrightness,
    setColorFilter,
    toggleBookmark,
    toggleHud,
    toggleFilmstrip,
    toggleFullscreen,
    nextPage,
    prevPage,
    goToPage,
    resetZoom,
  } = useReader({ comic, allComics, onClose });

  // Ocultar barra de estado nativa al ingresar al lector y restaurar al salir
  useEffect(() => {
    statusBarService.enterImmersiveReader();
    return () => {
      statusBarService.exitImmersiveReader();
    };
  }, []);

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

  // Dos clics / doble toque: abrir o cerrar el menú de controles del lector
  const handleDoubleTap = () => {
    toggleHud();
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

  const handleOpenNext = (targetComic: StoredComic) => {
    if (onOpenComic) {
      onOpenComic(targetComic);
    }
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
          isHudVisible={isHudVisible}
          onPageChange={goToPage}
          onToggleHud={toggleHud}
          isSnapMode={isSnapMode}
        />
      ) : (
        <PagedView
          pageUrl={currentPageUrl}
          secondPageUrl={secondPageUrl}
          isLoading={isLoadingPage}
          pageIndex={currentPageIndex}
          totalPages={totalPages}
          readingMode={readingMode}
          fitMode={fitMode}
          pageSpread={pageSpread}
          brightness={brightness}
          colorFilter={colorFilter}
          zoom={zoom}
          pan={pan}
          isHudVisible={isHudVisible}
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
        pageSpread={pageSpread}
        brightness={brightness}
        colorFilter={colorFilter}
        bookmarks={bookmarks}
        nextComic={nextComic}
        isHudVisible={isHudVisible}
        isFilmstripOpen={isFilmstripOpen}
        isFullscreen={isFullscreen}
        zoom={zoom}
        comicId={comic.id}
        onClose={onClose}
        onPageChange={goToPage}
        onReadingModeChange={setReadingMode}
        onFitModeChange={setFitMode}
        onPageSpreadChange={setPageSpread}
        onBrightnessChange={setBrightness}
        onColorFilterChange={setColorFilter}
        onToggleBookmark={toggleBookmark}
        onOpenNextComic={handleOpenNext}
        onToggleFilmstrip={toggleFilmstrip}
        onToggleFullscreen={toggleFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={resetZoom}
      />
    </div>
  );
};
