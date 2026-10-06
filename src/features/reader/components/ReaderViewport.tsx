import React, { useEffect } from 'react';
import { Menu } from 'lucide-react';
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
      {/* Botón superior visible para mostrar controles cuando el HUD está oculto */}
      {!isHudVisible && (
        <header
          className="absolute top-2 inset-x-0 z-30 flex items-center justify-between px-5 sm:px-8 select-none opacity-60 hover:opacity-100 transition-opacity duration-150"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHud();
            }}
            className="flex items-center gap-1.5 py-1 px-2 -ml-2 text-xs text-zinc-300 hover:text-white cursor-pointer"
            title="Abrir menú de controles"
          >
            <Menu className="h-4 w-4 shrink-0" />
            <span className="font-medium">Menú</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHud();
            }}
            className="font-mono text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer py-1 px-2 -mr-2"
            title="Abrir menú"
          >
            {currentPageIndex + 1}/{totalPages}
          </button>
        </header>
      )}

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
