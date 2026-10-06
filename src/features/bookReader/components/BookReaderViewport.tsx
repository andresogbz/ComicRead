import React, { useMemo } from 'react';
import { Highlighter, Copy, Loader2, AlertCircle } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
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

  // Filtrar resaltados para el capítulo actual
  const chapterHighlights = useMemo(() => {
    return highlights.filter((h) => h.chapterIndex === currentChapterIndex);
  }, [highlights, currentChapterIndex]);

  // Contenido del capítulo con marcas aplicadas
  const renderedContent = useMemo(() => {
    if (!currentChapter) return '';

    let html = currentChapter.content;

    // Aplicar resaltados al HTML del capítulo
    for (const h of chapterHighlights) {
      if (!h.text) continue;
      // Reemplazar la primera ocurrencia del texto con la etiqueta mark coloreada
      const escapedTarget = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTarget})`, 'i');
      html = html.replace(
        regex,
        `<mark style="background-color: ${h.color}55; color: inherit; border-bottom: 2px solid ${h.color}; padding: 1px 2px; border-radius: 2px;">$1</mark>`
      );
    }

    return html;
  }, [currentChapter, chapterHighlights]);

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

  const marginMaxWidth =
    preferences.marginSize === 'compact'
      ? 'max-w-xl'
      : preferences.marginSize === 'wide'
      ? 'max-w-3xl'
      : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col w-full h-full select-text transition-colors duration-200"
      style={{
        backgroundColor: themeConfig.bg,
        color: themeConfig.text,
      }}
    >
      {/* HUD de navegación */}
      <BookReaderHUD
        isVisible={isHudVisible}
        bookTitle={book.title}
        chapterTitle={currentChapter?.title || `Capítulo ${currentChapterIndex + 1}`}
        currentChapterIndex={currentChapterIndex}
        totalChapters={totalChapters}
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

      {/* Popover flotante al seleccionar texto (Marcatextos de Google Play Books) */}
      {selectionRange && selectionRange.rect && (
        <div
          className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white rounded-full border border-zinc-800 animate-in fade-in zoom-in-95 duration-100 select-none"
          style={{
            top: `${Math.max(12, selectionRange.rect.top - 46)}px`,
            left: `${Math.max(12, Math.min(window.innerWidth - 220, selectionRange.rect.left))}px`,
          }}
        >
          {/* Paleta rápida de colores para el marcatextos */}
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

      {/* Lienzo principal de lectura */}
      <div
        ref={contentRef}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-16 pb-24 px-4 sm:px-8 focus:outline-none"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin stroke-[1.5]" />
            <span className="text-xs">Cargando libro...</span>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-rose-500 px-4 text-center">
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
        ) : (
          <div className={`mx-auto ${marginMaxWidth}`}>
            {/* Título de capítulo */}
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

            {/* Texto del capítulo formateado */}
            <article
              className="book-prose leading-relaxed space-y-4"
              style={{
                fontFamily: fontFamilyStyle,
                fontSize: `${preferences.fontSize}px`,
                lineHeight: preferences.lineHeight,
              }}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
              onClick={(e) => {
                // Al tocar sin seleccionar, alternar HUD
                if (!window.getSelection()?.toString()) {
                  const target = e.target as HTMLElement;
                  if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
                    toggleHud();
                  }
                }
              }}
            />

            {/* Pie de navegación de capítulo */}
            <footer className="mt-14 pt-8 border-t border-current opacity-30 flex items-center justify-between text-xs font-sans select-none">
              <button
                type="button"
                onClick={prevChapter}
                disabled={currentChapterIndex <= 0}
                className="hover:opacity-100 disabled:opacity-20 cursor-pointer font-medium"
              >
                Capítulo anterior
              </button>

              <span className="opacity-70 font-mono">
                {currentChapterIndex + 1} / {totalChapters}
              </span>

              <button
                type="button"
                onClick={nextChapter}
                disabled={currentChapterIndex >= totalChapters - 1}
                className="hover:opacity-100 disabled:opacity-20 cursor-pointer font-medium"
              >
                Capítulo siguiente
              </button>
            </footer>
          </div>
        )}
      </div>

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
