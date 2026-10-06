import React from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import type { BookChapter } from '../types/book';

interface BookTocModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: BookChapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
}

export const BookTocModal: React.FC<BookTocModalProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterIndex,
  onSelectChapter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-950 text-zinc-100 flex flex-col max-h-[85vh] border-b border-t border-zinc-800">
        {/* Encabezado sin cajas */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-400 stroke-[2]" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 m-0">
              Índice de capítulos ({chapters.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar índice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de capítulos */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-zinc-800/60">
          {chapters.map((ch) => {
            const isCurrent = ch.index === currentChapterIndex;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChapter(ch.index)}
                className={`w-full text-left py-3 px-2 flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                  isCurrent ? 'text-amber-400 font-semibold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono text-zinc-500 w-6 shrink-0">
                    {ch.index + 1}
                  </span>
                  <span className="text-xs truncate">{ch.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ch.wordCount > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      ~{Math.max(1, Math.round(ch.wordCount / 200))} min
                    </span>
                  )}
                  {isCurrent && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pie de modal */}
        <div className="flex justify-end px-5 py-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
