import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Highlighter, Copy, Loader2, AlertCircle } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { statusBarService } from '../../../shared/services/statusBarService';
import { useBookReader } from '../hooks/useBookReader';
import { BookReaderHUD } from './BookReaderHUD';
import { BookTocModal } from './BookTocModal';
import { BookHighlightsModal } from './BookHighlightsModal';
import { BookSettingsModal } from './BookSettingsModal';
import { BOOK_THEMES, HIGHLIGHT_COLORS } from '../types/book';

interface BookReaderViewportProps {
  book: StoredComic;
  onClose: () => void;
}

export const BookReaderViewport: React.FC<BookReaderViewportProps> = ({
  book,
  onClose,
}) => {
  const {
    bookData,
    currentChapter,
    currentChapterIndex,
    totalChapters,
    isLoading,
    errorMessage,
    preferences,
    updatePreferences,
    highlights,
    selectedHighlightColor,
    setSelectedHighlightColor,
    isBookmarked,
    isHudVisible,
    isTocOpen,
    isHighlightsOpen,
    isSettingsOpen,
    selectionRange,
    contentRef,
    nextChapter,
    prevChapter,
    goToChapter,
    toggleBookmark,
    addHighlight,
    deleteHighlight,
    updateHighlightNote,
    toggleHud,
    setIsTocOpen,
    setIsHighlightsOpen,
    setIsSettingsOpen,
    setSelectionRange,
    handleTextSelection,
  } = useBookReader({ book, onClose });

  const themeConfig = BOOK_THEMES[preferences.theme] || BOOK_THEMES.sepia;

  // Inmersión completa de pantalla: ocultar barra de estado nativa en Android
  useEffect(() => {
    statusBarService.enterImmersiveReader();
    return () => {
      statusBarService.exitImmersiveReader();
    };
  }, []);

  // Medición dinámica del contenedor del lector
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number>(0);

  // Determinar si realmente se renderizan 2 columnas:
  // Solo si el usuario lo configuró explícitamente (columnCount === 2)
  // y la pantalla tiene ancho suficiente (>= 560px)
  const isTwoColumns = (preferences.columnCount ?? 1) === 2 && containerWidth >= 560;

  // En 2 columnas, la separación entre páginas es de 36px. En 1 columna, es 0px.
  const columnGapPx = isTwoColumns ? 36 : 0;

  // Paginación en capítulo estilo Huawei Books
  const [pageInChapter, setPageInChapter] = useState(0);
  const [totalPagesInChapter, setTotalPagesInChapter] = useState(1);

  // Animación fluida de paso de página (Deslizamiento o Desvanecimiento)
  const [animState, setAnimState] = useState<{
    direction: 'next' | 'prev';
    phase: 'exit' | 'enter';
  } | null>(null);
  const isAnimatingRef = useRef(false);

  const transitionType = preferences.pageTransition ?? 'slide';

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetEndRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Stride (paso de avance exacto entre páginas/spreads)
  // Spread S empieza exactamente en S * (containerWidth + columnGapPx)
  const getStride = useCallback(() => {
    const el = scrollContainerRef.current;
    const w = el ? el.clientWidth : containerWidth;
    if (w <= 0) return 0;
    const twoCols = (preferences.columnCount ?? 1) === 2 && w >= 560;
    const gap = twoCols ? 36 : 0;
    return w + gap;
  }, [preferences.columnCount, containerWidth]);

  // Filtrar resaltados para el capítulo actual
  const chapterHighlights = useMemo(() => {
    return highlights.filter((h) => h.chapterIndex === currentChapterIndex);
  }, [highlights, currentChapterIndex]);

  // Contenido del capítulo con marcas aplicadas
  const renderedContent = useMemo(() => {
    if (!currentChapter) return '';

    let html = currentChapter.content;

    for (const h of chapterHighlights) {
      if (!h.text) continue;
      const escapedTarget = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTarget})`, 'i');
      html = html.replace(
        regex,
        `<mark style="background-color: ${h.color}55; color: inherit; border-bottom: 2px solid ${h.color}; padding: 1px 2px; border-radius: 2px;">$1</mark>`
      );
    }

    return html;
  }, [currentChapter, chapterHighlights]);

  // Observador de dimensiones desacoplado: observa el wrapper exterior fijo para evitar parpadeos
  useEffect(() => {
    const el = viewportWrapperRef.current;
    if (!el) return;

    const updateSize = () => {
      if (viewportWrapperRef.current) {
        const w = viewportWrapperRef.current.clientWidth;
        if (w > 0 && Math.abs(w - lastWidthRef.current) > 2) {
          lastWidthRef.current = w;
          setContainerWidth(w);
        }
      }
    };

    updateSize();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && Math.abs(w - lastWidthRef.current) > 2) {
          lastWidthRef.current = w;
          setContainerWidth(w);
        }
      }
    });
    ro.observe(el);

    const handleWindowResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, [preferences.readingMode, preferences.marginSize, preferences.columnCount]);

  // Recalcular número de páginas en el capítulo al cambiar contenido o dimensiones
  const recalculatePages = useCallback(() => {
    if (preferences.readingMode === 'scroll') return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const clientW = el.clientWidth;
    if (clientW <= 0) return;

    const twoCols = (preferences.columnCount ?? 1) === 2 && clientW >= 560;
    const gap = twoCols ? 36 : 0;
    const stride = clientW + gap;

    const scrollW = el.scrollWidth;
    const computedPages = Math.max(1, Math.ceil((scrollW - 10) / stride));
    setTotalPagesInChapter(computedPages);

    if (targetEndRef.current) {
      targetEndRef.current = false;
      const lastPage = Math.max(0, computedPages - 1);
      setPageInChapter(lastPage);
      el.scrollTo({ left: lastPage * stride, behavior: 'instant' });
    } else {
      setPageInChapter((prev) => {
        const clamped = Math.min(prev, Math.max(0, computedPages - 1));
        el.scrollTo({ left: clamped * stride, behavior: 'instant' });
        return clamped;
      });
    }
  }, [preferences.readingMode, preferences.columnCount]);

  // Ejecutar recálculo cuando cambia el capítulo, el HTML, o las preferencias
  useEffect(() => {
    const timer = setTimeout(() => {
      recalculatePages();
    }, 50);

    return () => clearTimeout(timer);
  }, [
    renderedContent,
    preferences.fontSize,
    preferences.lineHeight,
    preferences.fontFamily,
    preferences.columnCount,
    preferences.marginSize,
    containerWidth,
    recalculatePages,
  ]);

  // Al cambiar de capítulo externamente
  useEffect(() => {
    if (!targetEndRef.current) {
      setPageInChapter(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'instant' });
      }
    }
  }, [currentChapterIndex]);

  // Actualizar desplazamiento cuando cambia pageInChapter
  const syncScrollPosition = useCallback((targetPage: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const stride = getStride();
    if (stride > 0) {
      el.scrollTo({ left: targetPage * stride, behavior: 'instant' });
    }
  }, [getStride]);

  // Clase CSS de animación de página fluida
  const animationClass = useMemo(() => {
    if (!animState || transitionType === 'none') return '';

    if (transitionType === 'fade') {
      return animState.phase === 'exit' ? 'page-fade-exit' : 'page-fade-enter';
    }

    if (animState.direction === 'next') {
      return animState.phase === 'exit' ? 'page-slide-next-exit' : 'page-slide-next-enter';
    } else {
      return animState.phase === 'exit' ? 'page-slide-prev-exit' : 'page-slide-prev-enter';
    }
  }, [animState, transitionType]);

  // Animación fluida y limpia de paso de página (Zero flicker, Zero 3D distortion)
  const turnNextPage = useCallback(() => {
    if (isAnimatingRef.current) return;

    if (pageInChapter < totalPagesInChapter - 1) {
      if (transitionType === 'none') {
        const nextP = pageInChapter + 1;
        setPageInChapter(nextP);
        syncScrollPosition(nextP);
        return;
      }

      isAnimatingRef.current = true;
      setAnimState({ direction: 'next', phase: 'exit' });

      setTimeout(() => {
        const nextP = pageInChapter + 1;
        setPageInChapter(nextP);
        syncScrollPosition(nextP);
        setAnimState({ direction: 'next', phase: 'enter' });

        setTimeout(() => {
          setAnimState(null);
          isAnimatingRef.current = false;
        }, 140);
      }, 120);
    } else if (currentChapterIndex < totalChapters - 1) {
      if (transitionType === 'none') {
        nextChapter();
        setPageInChapter(0);
        return;
      }

      isAnimatingRef.current = true;
      setAnimState({ direction: 'next', phase: 'exit' });

      setTimeout(() => {
        nextChapter();
        setPageInChapter(0);
        setAnimState({ direction: 'next', phase: 'enter' });

        setTimeout(() => {
          setAnimState(null);
          isAnimatingRef.current = false;
        }, 140);
      }, 120);
    }
  }, [
    pageInChapter,
    totalPagesInChapter,
    currentChapterIndex,
    totalChapters,
    transitionType,
    nextChapter,
    syncScrollPosition,
  ]);

  const turnPrevPage = useCallback(() => {
    if (isAnimatingRef.current) return;

    if (pageInChapter > 0) {
      if (transitionType === 'none') {
        const prevP = pageInChapter - 1;
        setPageInChapter(prevP);
        syncScrollPosition(prevP);
        return;
      }

      isAnimatingRef.current = true;
      setAnimState({ direction: 'prev', phase: 'exit' });

      setTimeout(() => {
        const prevP = pageInChapter - 1;
        setPageInChapter(prevP);
        syncScrollPosition(prevP);
        setAnimState({ direction: 'prev', phase: 'enter' });

        setTimeout(() => {
          setAnimState(null);
          isAnimatingRef.current = false;
        }, 140);
      }, 120);
    } else if (currentChapterIndex > 0) {
      if (transitionType === 'none') {
        targetEndRef.current = true;
        prevChapter();
        return;
      }

      targetEndRef.current = true;
      isAnimatingRef.current = true;
      setAnimState({ direction: 'prev', phase: 'exit' });

      setTimeout(() => {
        prevChapter();
        setAnimState({ direction: 'prev', phase: 'enter' });

        setTimeout(() => {
          setAnimState(null);
          isAnimatingRef.current = false;
        }, 140);
      }, 120);
    }
  }, [
    pageInChapter,
    currentChapterIndex,
    transitionType,
    prevChapter,
  ]);

  // Toques en pantalla según zonas Huawei Books:
  // - Si el menú está abierto: cualquier toque lo cierra inmediatamente
  // - Lateral izquierdo (30%): página anterior
  // - Lateral derecho (30%): página siguiente
  // - Centro (40%): alternar menú HUD
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si hay texto seleccionado, no pasar página
    if (window.getSelection()?.toString().trim()) {
      return;
    }

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }

    if (isHudVisible) {
      toggleHud();
      return;
    }

    if (preferences.readingMode === 'scroll') {
      toggleHud();
      return;
    }

    const clientX = e.clientX;
    const width = window.innerWidth;

    if (clientX < width * 0.3) {
      turnPrevPage();
    } else if (clientX > width * 0.7) {
      turnNextPage();
    } else {
      toggleHud();
    }
  };

  // Gestos de deslizamiento táctil horizontal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (preferences.readingMode === 'scroll') return;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        turnNextPage();
      } else {
        turnPrevPage();
      }
    }
  };

  const handleCopySelection = () => {
    if (selectionRange?.text) {
      navigator.clipboard.writeText(selectionRange.text);
      setSelectionRange(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleApplyHighlight = (color?: string) => {
    if (selectionRange?.text) {
      addHighlight(selectionRange.text, color || selectedHighlightColor);
    }
  };

  const fontFamilyStyle =
    preferences.fontFamily === 'serif'
      ? '"Literata", Georgia, Cambria, serif'
      : preferences.fontFamily === 'mono'
      ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
      : 'system-ui, -apple-system, sans-serif';

  // Margen y ancho dinámicos según preferencias de lectura
  const marginWrapperClass = useMemo(() => {
    const isTwoCol = (preferences.columnCount ?? 1) === 2;
    if (isTwoCol) {
      switch (preferences.marginSize) {
        case 'compact':
          return 'max-w-7xl px-3 sm:px-6';
        case 'wide':
          return 'max-w-5xl px-8 sm:px-14';
        case 'normal':
        default:
          return 'max-w-6xl px-5 sm:px-10';
      }
    }

    // 1 Columna (Default): Medida cómoda de lectura tipo libro
    switch (preferences.marginSize) {
      case 'compact':
        return 'max-w-4xl px-3 sm:px-6';
      case 'wide':
        return 'max-w-xl px-8 sm:px-14';
      case 'normal':
      default:
        return 'max-w-2xl lg:max-w-3xl px-5 sm:px-10';
    }
  }, [preferences.marginSize, preferences.columnCount]);

  const scrollModeMarginClass = useMemo(() => {
    switch (preferences.marginSize) {
      case 'compact':
        return 'max-w-4xl';
      case 'wide':
        return 'max-w-2xl';
      case 'normal':
      default:
        return 'max-w-3xl';
    }
  }, [preferences.marginSize]);

  // Porcentaje general de avance del libro
  const overallBookPercent =
    totalChapters > 0
      ? Math.round(
          ((currentChapterIndex + (totalPagesInChapter > 0 ? pageInChapter / totalPagesInChapter : 0)) /
            totalChapters) *
            100
        )
      : 0;

  return (
    <div
      onClick={handleScreenClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col w-full h-full select-text transition-colors duration-200 overflow-hidden cursor-pointer"
      style={{
        backgroundColor: themeConfig.bg,
        color: themeConfig.text,
      }}
    >
      {/* HUD de navegación estilo Huawei Books */}
      <BookReaderHUD
        isVisible={isHudVisible}
        bookTitle={book.title}
        chapterTitle={currentChapter?.title || `Capítulo ${currentChapterIndex + 1}`}
        currentChapterIndex={currentChapterIndex}
        totalChapters={totalChapters}
        currentPageInChapter={pageInChapter}
        totalPagesInChapter={totalPagesInChapter}
        isBookmarked={isBookmarked}
        activeHighlightColor={selectedHighlightColor}
        onSelectHighlightColor={setSelectedHighlightColor}
        onClose={onClose}
        onPrevChapter={prevChapter}
        onNextChapter={nextChapter}
        onSeekChapter={goToChapter}
        onToggleBookmark={toggleBookmark}
        onOpenToc={() => setIsTocOpen(true)}
        onOpenHighlights={() => setIsHighlightsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Popover flotante al seleccionar texto */}
      {selectionRange && selectionRange.rect && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white rounded-full border border-zinc-800 animate-in fade-in zoom-in-95 duration-100 select-none shadow-none"
          style={{
            top: `${Math.max(12, selectionRange.rect.top - 46)}px`,
            left: `${Math.max(12, Math.min(window.innerWidth - 220, selectionRange.rect.left))}px`,
          }}
        >
          <div className="flex items-center gap-1.5 pr-2 border-r border-zinc-800">
            {HIGHLIGHT_COLORS.map((hc) => (
              <button
                key={hc.id}
                type="button"
                onClick={() => handleApplyHighlight(hc.color)}
                className="h-4 w-4 rounded-full transition-transform hover:scale-125 cursor-pointer"
                style={{ backgroundColor: hc.color }}
                title={hc.name}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleApplyHighlight()}
            className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 px-1 transition-colors cursor-pointer"
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>Resaltar</span>
          </button>

          <button
            type="button"
            onClick={handleCopySelection}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Copiar texto"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Lienzo Principal de Lectura */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin stroke-[1.5]" />
          <span className="text-xs">Cargando libro...</span>
        </div>
      ) : errorMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3 text-rose-500 px-4 text-center">
          <AlertCircle className="h-7 w-7" />
          <p className="text-xs font-medium">{errorMessage}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-xs font-semibold underline cursor-pointer"
          >
            Volver a la biblioteca
          </button>
        </div>
      ) : preferences.readingMode === 'scroll' ? (
        /* Modo continuo vertical tradicional */
        <div
          ref={contentRef}
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-12 pb-20 px-4 sm:px-12 md:px-20 focus:outline-none"
        >
          <div className={`mx-auto w-full ${scrollModeMarginClass}`}>
            {currentChapter && (
              <header className="mb-8 pb-4 border-b border-current opacity-30 select-none">
                <span className="text-xs font-sans uppercase opacity-75">
                  Capítulo {currentChapterIndex + 1} de {totalChapters}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                  {currentChapter.title}
                </h2>
              </header>
            )}

            <article
              className="book-prose leading-relaxed space-y-4"
              style={{
                fontFamily: fontFamilyStyle,
                fontSize: `${preferences.fontSize}px`,
                lineHeight: preferences.lineHeight,
              }}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        </div>
      ) : (
        /* Modo Paginado Huawei Books con Animación Limpia y Fluida */
        <div className="relative flex-1 w-full h-full overflow-hidden pt-8 pb-9 flex items-center justify-center">
          <div
            ref={viewportWrapperRef}
            className={`w-full h-full mx-auto flex items-center justify-center ${marginWrapperClass}`}
          >
            <div
              ref={scrollContainerRef}
              className={`w-full h-full overflow-hidden page-anim-container ${animationClass}`}
            >
              <div
                ref={contentRef}
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                className="h-full w-full book-prose focus:outline-none"
                style={{
                  fontFamily: fontFamilyStyle,
                  fontSize: `${preferences.fontSize}px`,
                  lineHeight: preferences.lineHeight,
                  height: '100%',
                  columnFill: 'auto',
                  columnWidth:
                    isTwoColumns && containerWidth > 0
                      ? `${(containerWidth - columnGapPx) / 2}px`
                      : containerWidth > 0
                      ? `${containerWidth}px`
                      : '100%',
                  columnGap: `${columnGapPx}px`,
                }}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pie sutil e inmersivo Huawei Books cuando el HUD está oculto */}
      {!isHudVisible && !isLoading && (
        <footer className="pointer-events-none absolute bottom-2 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 text-[11px] font-sans opacity-40 select-none transition-opacity duration-300">
          <span className="font-mono text-[10px]">
            Pág. {pageInChapter + 1} / {totalPagesInChapter}
          </span>
          <span className="font-mono text-[10px]">{overallBookPercent}%</span>
        </footer>
      )}

      {/* Modales integrados */}
      <BookTocModal
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        chapters={bookData?.chapters || []}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={goToChapter}
      />

      <BookHighlightsModal
        isOpen={isHighlightsOpen}
        onClose={() => setIsHighlightsOpen(false)}
        highlights={highlights}
        onSelectHighlight={goToChapter}
        onDeleteHighlight={deleteHighlight}
        onUpdateNote={updateHighlightNote}
      />

      <BookSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />
    </div>
  );
};
