import React, { useState } from 'react';
import { X, Trash2, Bookmark, MessageSquare, Check } from 'lucide-react';
import type { BookHighlight } from '../../../domain/entities/Comic';

interface BookHighlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: BookHighlight[];
  onSelectHighlight: (chapterIndex: number) => void;
  onDeleteHighlight: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

export const BookHighlightsModal: React.FC<BookHighlightsModalProps> = ({
  isOpen,
  onClose,
  highlights,
  onSelectHighlight,
  onDeleteHighlight,
  onUpdateNote,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (h: BookHighlight) => {
    setEditingId(h.id);
    setNoteDraft(h.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, noteDraft.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-950 text-zinc-100 flex flex-col max-h-[85vh] border-b border-t border-zinc-800">
        {/* Encabezado sin recuadros */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-400 stroke-[2]" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 m-0">
              Resaltados y notas ({highlights.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de resaltados */}
        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-zinc-800/60">
          {highlights.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              <p className="m-0 font-medium text-zinc-400">No hay textos resaltados todavía</p>
              <p className="m-0 mt-1">Selecciona cualquier texto durante la lectura para usar el marcatextos</p>
            </div>
          ) : (
            highlights.map((h) => (
              <div key={h.id} className="py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => {
                      if (typeof h.chapterIndex === 'number') {
                        onSelectHighlight(h.chapterIndex);
                        onClose();
                      }
                    }}
                    className="flex-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="text-[11px] text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">
                        {h.chapterTitle || 'Capítulo'}
                      </span>
                    </div>

                    <p
                      className="text-xs text-zinc-200 leading-relaxed font-serif pl-3 border-l-2 my-1"
                      style={{ borderLeftColor: h.color }}
                    >
                      &ldquo;{h.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(h)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Agregar nota"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHighlight(h.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Eliminar resaltado"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Nota agregada o editor de nota */}
                {editingId === h.id ? (
                  <div className="flex items-center gap-2 pt-1 pl-3">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Escribe una nota o comentario..."
                      className="flex-1 bg-zinc-900 px-3 py-1 text-xs text-zinc-200 rounded-none border-b border-zinc-700 focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(h.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      title="Guardar nota"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  h.note && (
                    <div className="pl-3 text-[11px] text-amber-200/90 italic flex items-center gap-1.5">
                      <span className="text-zinc-500 not-italic">Nota:</span>
                      <span>{h.note}</span>
                    </div>
                  )
                )}
              </div>
            ))
          )}
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
