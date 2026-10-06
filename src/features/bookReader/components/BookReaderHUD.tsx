import React from 'react';
import {
  ArrowLeft,
  List,
  Sliders,
  Bookmark,
  Highlighter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { HIGHLIGHT_COLORS, type HighlightColorOption } from '../types/book';

interface BookReaderHUDProps {
  isVisible: boolean;
  bookTitle: string;
  chapterTitle: string;
  currentChapterIndex: number;
  totalChapters: number;
  currentPageInChapter?: number;
  totalPagesInChapter?: number;
  isBookmarked: boolean;
  activeHighlightColor: string;
  onSelectHighlightColor: (color: string) => void;
  onClose: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onSeekChapter: (index: number) => void;
  onToggleBookmark: () => void;
  onOpenToc: () => void;
  onOpenHighlights: () => void;
  onOpenSettings: () => void;
}

export const BookReaderHUD: React.FC<BookReaderHUDProps> = ({
  isVisible,
  bookTitle,
  chapterTitle,
  currentChapterIndex,
  totalChapters,
  currentPageInChapter,
  totalPagesInChapter,
  isBookmarked,
  activeHighlightColor,
  onSelectHighlightColor,
  onClose,
  onPrevChapter,
  onNextChapter,
  onSeekChapter,
  onToggleBookmark,
  onOpenToc,
  onOpenHighlights,
  onOpenSettings,
}) => {
  const progressPercent =
    totalChapters > 0
      ? Math.round(((currentChapterIndex + 1) / totalChapters) * 100)
      : 0;

  return (
    <>
      {/* Barra Superior Flotante Minimalista tipo Huawei Books */}
      <header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-black/90 text-zinc-200 backdrop-blur-md border-b border-zinc-800/80 select-none transition-all duration-200 ease-out ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Volver a la biblioteca"
            title="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold truncate text-zinc-100 m-0">
              {bookTitle}
            </h1>
            <span className="text-[11px] text-zinc-400 truncate">
              {chapterTitle}
            </span>
          </div>
        </div>

        {/* Acciones superiores Huawei Books */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Marcador de lectura */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={isBookmarked ? 'Marcador guardado' : 'Guardar marcador'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Índice de capítulos (TOC) */}
          <button
            type="button"
            onClick={onOpenToc}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Índice de capítulos"
          >
            <List className="h-4 w-4" />
          </button>

          {/* Resaltados y notas */}
          <button
            type="button"
            onClick={onOpenHighlights}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Resaltados y notas"
          >
            <Highlighter className="h-4 w-4" />
          </button>

          {/* Ajustes tipográficos */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Ajustes de lectura"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Barra Inferior Flotante Minimalista tipo Huawei Books */}
      <footer
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 px-3 sm:px-6 py-3 bg-black/90 text-zinc-200 backdrop-blur-md border-t border-zinc-800/80 select-none transition-all duration-200 ease-out ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Selector rápido de marcatextos */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/50">
          <span className="text-[10px] text-zinc-400 font-medium">
            Marcatextos:
          </span>

          <div className="flex items-center gap-2">
            {HIGHLIGHT_COLORS.map((hc: HighlightColorOption) => {
              const isSelected = activeHighlightColor === hc.color;
              return (
                <button
                  key={hc.id}
                  type="button"
                  onClick={() => onSelectHighlightColor(hc.color)}
                  className={`h-4 w-4 rounded-full transition-transform cursor-pointer ${
                    isSelected ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-black' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: hc.color }}
                  title={hc.name}
                />
              );
            })}
          </div>
        </div>

        {/* Deslizador de progreso y salto de capítulo */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onPrevChapter}
            disabled={currentChapterIndex <= 0}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex-1 flex items-center gap-3 max-w-md">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalChapters - 1)}
              value={currentChapterIndex}
              onChange={(e) => onSeekChapter(Number(e.target.value))}
              className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
              {currentChapterIndex + 1}/{totalChapters}
              {typeof currentPageInChapter === 'number' && typeof totalPagesInChapter === 'number' && (
                <span className="ml-1 text-zinc-500">
                  (Pág. {currentPageInChapter + 1}/{totalPagesInChapter})
                </span>
              )}
              <span className="ml-1.5 text-zinc-400 font-semibold">{progressPercent}%</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onNextChapter}
            disabled={currentChapterIndex >= totalChapters - 1}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </>
  );
};
