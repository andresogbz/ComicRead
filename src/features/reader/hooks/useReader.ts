import { useState, useEffect, useCallback, useRef } from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { readerCache } from '../services/readerCacheService';
import type { ReadingMode, FitMode } from '../types/readerTypes';

interface UseReaderProps {
  comic: StoredComic;
  onClose: () => void;
}

export function useReader({ comic, onClose }: UseReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    comic.lastReadPageIndex || 0
  );
  const [readingMode, setReadingMode] = useState<ReadingMode>('ltr');
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicializar sesión de cómic en caché y Web Worker
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      setIsLoadingPage(true);
      await readerCache.initSession(comic.id, comic.fileName);
      if (isCancelled) return;

      const url = await readerCache.getPageUrl(comic.id, currentPageIndex);
      if (!isCancelled) {
        setCurrentPageUrl(url);
        setIsLoadingPage(false);
        readerCache.prefetchRange(comic.id, currentPageIndex, comic.totalPages);
      }
    }

    init();

    return () => {
      isCancelled = true;
      readerCache.clearAll();
    };
  }, [comic.id, comic.fileName]);

  // Cargar página actual y disparar prefetch al cambiar de página
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingPage(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });

    readerCache
      .getPageUrl(comic.id, currentPageIndex)
      .then((url) => {
        if (!isCancelled) {
          setCurrentPageUrl(url);
          setIsLoadingPage(false);
          readerCache.prefetchRange(comic.id, currentPageIndex, comic.totalPages);
        }
      })
      .catch((err) => {
        console.error('Error cargando página:', err);
        if (!isCancelled) setIsLoadingPage(false);
      });

    // Guardar progreso automáticamente en IndexedDB
    comicRepository.updateProgress(comic.id, currentPageIndex, comic.totalPages);

    return () => {
      isCancelled = true;
    };
  }, [comic.id, comic.totalPages, currentPageIndex]);

  // Auto-ocultar HUD tras 3.5 segundos de inactividad
  const resetHudTimer = useCallback(() => {
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setIsHudVisible(false);
    }, 3500);
  }, []);

  const toggleHud = useCallback(() => {
    setIsHudVisible((prev) => {
      const next = !prev;
      if (next) resetHudTimer();
      return next;
    });
  }, [resetHudTimer]);

  const showHudTemporarily = useCallback(() => {
    setIsHudVisible(true);
    resetHudTimer();
  }, [resetHudTimer]);

  // Navegación
  const goToPage = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, comic.totalPages - 1));
      setCurrentPageIndex(target);
    },
    [comic.totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPageIndex < comic.totalPages - 1) {
      goToPage(currentPageIndex + 1);
    }
  }, [currentPageIndex, comic.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1);
    }
  }, [currentPageIndex, goToPage]);

  // Pantalla completa nativa
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Escuchar cambios de pantalla completa iniciados por tecla F11 o sistema
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Control de teclado para lectura ergonómica
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (readingMode === 'rtl') {
          prevPage();
        } else {
          nextPage();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (readingMode === 'rtl') {
          nextPage();
        } else {
          prevPage();
        }
      } else if (e.key === ' ' && readingMode !== 'webtoon') {
        e.preventDefault();
        if (readingMode === 'rtl') {
          prevPage();
        } else {
          nextPage();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, nextPage, prevPage, toggleFullscreen, isFullscreen, onClose]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    currentPageIndex,
    totalPages: comic.totalPages,
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
    showHudTemporarily,
    toggleFullscreen,
    nextPage,
    prevPage,
    goToPage,
    resetZoom,
  };
}
