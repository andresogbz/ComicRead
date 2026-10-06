import { useState, useEffect, useCallback, useRef } from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import type { BookHighlight } from '../../../domain/entities/Comic';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { bookFileService } from '../services/bookFileService';
import { backupService } from '../../settings/services/backupService';
import {
  type BookData,
  type BookPreferences,
  DEFAULT_BOOK_PREFERENCES,
  HIGHLIGHT_COLORS,
} from '../types/book';

interface UseBookReaderProps {
  book: StoredComic;
  onClose: () => void;
}

const PREFS_KEY = 'gomic_book_preferences';

export function useBookReader({ book, onClose }: UseBookReaderProps) {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(
    Math.max(0, Math.min(book.lastReadPageIndex || 0, Math.max(0, book.totalPages - 1)))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preferencias de lectura estilo Google Books
  const [preferences, setPreferences] = useState<BookPreferences>(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return { ...DEFAULT_BOOK_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      // Ignorar
    }
    return DEFAULT_BOOK_PREFERENCES;
  });

  // Resaltados y notas
  const [highlights, setHighlights] = useState<BookHighlight[]>(book.highlights || []);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>(
    HIGHLIGHT_COLORS[0].color
  );

  // Modales y menús
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<number[]>(
    book.bookmarks || []
  );
  const isBookmarked = bookmarkedChapters.includes(currentChapterIndex);

  // Selección de texto activa para marcatextos
  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    rect: DOMRect | null;
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  // Cargar archivo original y parsear estructura de libro
  useEffect(() => {
    let isCancelled = false;

    const loadBookContent = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const fileBlob = await comicRepository.getComicFile(book.id);
        if (!fileBlob) {
          throw new Error('No se encontró el archivo del libro en el almacenamiento.');
        }

        const file = new File([fileBlob], book.fileName, { type: fileBlob.type });
        const { bookData: parsed } = await bookFileService.processBookFile(file);

        if (!isCancelled) {
          setBookData(parsed);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('[useBookReader] Error al cargar libro:', err);
          setErrorMessage(err?.message || 'No se pudo abrir el libro.');
          setIsLoading(false);
        }
      }
    };

    loadBookContent();

    return () => {
      isCancelled = true;
    };
  }, [book.id, book.fileName]);

  // Actualizar preferencias persistentes
  const updatePreferences = useCallback((updater: Partial<BookPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updater };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  }, []);

  // Actualizar progreso de lectura
  useEffect(() => {
    if (!bookData || bookData.chapters.length === 0) return;

    comicRepository.updateProgress(
      book.id,
      currentChapterIndex,
      bookData.chapters.length
    );

    backupService.scheduleAutoBackup(3000);
  }, [book.id, currentChapterIndex, bookData]);

  // Navegación de capítulos
  const nextChapter = useCallback(() => {
    if (!bookData) return;
    if (currentChapterIndex < bookData.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [bookData, currentChapterIndex]);

  const prevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [currentChapterIndex]);

  const goToChapter = useCallback(
    (idx: number) => {
      if (!bookData) return;
      if (idx >= 0 && idx < bookData.chapters.length) {
        setCurrentChapterIndex(idx);
        setIsTocOpen(false);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
    },
    [bookData]
  );

  // Marcador de capítulo (Bookmark)
  const toggleBookmark = useCallback(async () => {
    const updated = await comicRepository.toggleBookmark(book.id, currentChapterIndex);
    setBookmarkedChapters(updated);
    backupService.scheduleAutoBackup(1000);
  }, [book.id, currentChapterIndex]);

  // Gestión de Marcatextos / Resaltados
  const addHighlight = useCallback(
    async (text: string, color: string, note?: string) => {
      if (!text.trim()) return;

      const currentChapter = bookData?.chapters[currentChapterIndex];

      const newHighlight: BookHighlight = {
        id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        comicId: book.id,
        text: text.trim(),
        color,
        note,
        chapterIndex: currentChapterIndex,
        chapterTitle: currentChapter?.title || `Capítulo ${currentChapterIndex + 1}`,
        createdAt: Date.now(),
      };

      const updated = await comicRepository.addHighlight(book.id, newHighlight);
      setHighlights(updated);
      setSelectionRange(null);

      // Despejar selección nativa del DOM
      window.getSelection()?.removeAllRanges();

      backupService.scheduleAutoBackup(1000);
    },
    [book.id, bookData, currentChapterIndex]
  );

  const deleteHighlight = useCallback(
    async (highlightId: string) => {
      const updated = await comicRepository.deleteHighlight(book.id, highlightId);
      setHighlights(updated);
      backupService.scheduleAutoBackup(1000);
    },
    [book.id]
  );

  const updateHighlightNote = useCallback(
    async (highlightId: string, note: string) => {
      const updated = await comicRepository.updateHighlightNote(book.id, highlightId, note);
      setHighlights(updated);
      backupService.scheduleAutoBackup(1000);
    },
    [book.id]
  );

  // Escuchar selección de texto dentro del área de lectura
  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelectionRange(null);
      return;
    }

    const text = sel.toString().trim();
    if (text.length > 2 && contentRef.current?.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionRange({ text, rect });
      } catch {
        setSelectionRange(null);
      }
    } else {
      setSelectionRange(null);
    }
  }, []);

  const toggleHud = useCallback(() => {
    setIsHudVisible((prev) => !prev);
  }, []);

  return {
    bookData,
    currentChapter: bookData?.chapters[currentChapterIndex] || null,
    currentChapterIndex,
    totalChapters: bookData?.chapters.length || 0,
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
    onClose,
  };
}
