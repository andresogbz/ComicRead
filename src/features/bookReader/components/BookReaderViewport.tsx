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

  // Detección de orientación Horizontal (Landscape) para eliminar márgenes muertos
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Paginación en capítulo estilo Huawei Books
  const [pageInChapter, setPageInChapter] = useState(0);
  const [totalPagesInChapter, setTotalPagesInChapter] = useState(1);
  const [flipAnimation, setFlipAnimation] = useState<'next' | 'prev' | 'enter' | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetEndRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

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

  // Recalcular número de páginas en el capítulo al cambiar contenido o dimensiones
  const recalculatePages = useCallback(() => {
    if (preferences.readingMode === 'scroll') return;
    const el = scrollContainerRef.current;
    if (!el) return;

    // Con column-fill: auto y overflow: hidden, el número de páginas es el ancho total entre el ancho visible
    const clientW = el.clientWidth;
    if (clientW <= 0) return;

    const scrollW = el.scrollWidth;
    const computedPages = Math.max(1, Math.round(scrollW / clientW));
    setTotalPagesInChapter(computedPages);

    if (targetEndRef.current) {
      targetEndRef.current = false;
      const lastPage = Math.max(0, computedPages - 1);
      setPageInChapter(lastPage);
      el.scrollTo({ left: lastPage * clientW, behavior: 'instant' });
    } else {
      setPageInChapter((prev) => {
        const clamped = Math.min(prev, Math.max(0, computedPages - 1));
        el.scrollTo({ left: clamped * clientW, behavior: 'instant' });
        return clamped;
      });
    }
  }, [preferences.readingMode]);

  // Ejecutar recálculo cuando cambia el capítulo, el HTML, o las dimensiones
  useEffect(() => {
    const timer = setTimeout(() => {
      recalculatePages();
    }, 60);

    return () => clearTimeout(timer);
  }, [renderedContent, preferences.fontSize, preferences.lineHeight, preferences.fontFamily, isLandscape, recalculatePages]);

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
    el.scrollTo({ left: targetPage * el.clientWidth, behavior: 'instant' });
  }, []);

  // Animación 3D realista de paso de página (Efecto Hoja tipo Huawei Books)
  const turnNextPage = useCallback(() => {
    if (flipAnimation) return;

    if (pageInChapter < totalPagesInChapter - 1) {
      setFlipAnimation('next');
      setTimeout(() => {
        const nextP = pageInChapter + 1;
        setPageInChapter(nextP);
        syncScrollPosition(nextP);
        setFlipAnimation('enter');
        setTimeout(() => setFlipAnimation(null), 120);
      }, 240);
    } else if (currentChapterIndex < totalChapters - 1) {
      setFlipAnimation('next');
      setTimeout(() => {
        nextChapter();
        setPageInChapter(0);
        setFlipAnimation(null);
      }, 200);
    }
  }, [flipAnimation, pageInChapter, totalPagesInChapter, currentChapterIndex, totalChapters, nextChapter, syncScrollPosition]);

  const turnPrevPage = useCallback(() => {
    if (flipAnimation) return;

    if (pageInChapter > 0) {
      setFlipAnimation('prev');
      setTimeout(() => {
        const prevP = pageInChapter - 1;
        setPageInChapter(prevP);
        syncScrollPosition(prevP);
        setFlipAnimation('enter');
        setTimeout(() => setFlipAnimation(null), 120);
      }, 240);
    } else if (currentChapterIndex > 0) {
      targetEndRef.current = true;
      setFlipAnimation('prev');
      setTimeout(() => {
        prevChapter();
        setFlipAnimation(null);
      }, 200);
    }
  }, [flipAnimation, pageInChapter, currentChapterIndex, prevChapter, syncScrollPosition]);

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

      {/* Cabecera sutil e inmersiva Huawei Books cuando el HUD está oculto */}
      {!isHudVisible && currentChapter && !isLoading && (
        <header className="pointer-events-none absolute top-2 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 text-[11px] font-sans opacity-40 select-none transition-opacity duration-300">
          <span className="truncate max-w-[70%]">{currentChapter.title}</span>
          <span className="font-mono text-[10px]">
            {currentChapterIndex + 1}/{totalChapters}
          </span>
        </header>
      )}

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
          <div className="mx-auto w-full max-w-4xl">
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
        /* Modo Paginado Huawei Books con Animación 3D y 2 Columnas en Horizontal */
        <div className="relative flex-1 w-full h-full overflow-hidden pt-8 pb-9 px-5 sm:px-10 md:px-16 page-flip-stage">
          <div
            ref={scrollContainerRef}
            className={`w-full h-full overflow-hidden transition-transform duration-75 ${
              flipAnimation === 'next'
                ? 'page-flip-next-exit'
                : flipAnimation === 'prev'
                ? 'page-flip-prev-exit'
                : flipAnimation === 'enter'
                ? 'page-flip-enter'
                : ''
            }`}
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
                columnWidth: isLandscape ? 'calc((100vw - 12rem) / 2)' : 'calc(100vw - 3rem)',
                columnGap: isLandscape ? '4rem' : '0px',
              }}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
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
