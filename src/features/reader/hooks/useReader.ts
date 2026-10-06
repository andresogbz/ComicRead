import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { readerCache } from '../services/readerCacheService';
import { findNextComic } from '../services/chapterNavigation';
import type { ReadingMode, FitMode, PageSpread, ColorFilter } from '../types/readerTypes';

interface UseReaderProps {
  comic: StoredComic;
  allComics?: StoredComic[];
  onClose: () => void;
}

const PREFS_STORAGE_KEY = 'gomic_reader_preferences';

interface StoredReaderPrefs {
  readingMode?: ReadingMode;
  fitMode?: FitMode;
  pageSpread?: PageSpread;
  brightness?: number;
  colorFilter?: ColorFilter;
}

function loadSavedPrefs(): StoredReaderPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: Partial<StoredReaderPrefs>) {
  try {
    const current = loadSavedPrefs();
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // Silencioso en modo incógnito o storage lleno
  }
}

export function useReader({ comic, allComics = [], onClose }: UseReaderProps) {
  const savedPrefs = loadSavedPrefs();

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    comic.lastReadPageIndex || 0
  );
  const [bookmarks, setBookmarks] = useState<number[]>(comic.bookmarks || []);
  const [readingMode, setReadingModeState] = useState<ReadingMode>(
    savedPrefs.readingMode || 'ltr'
  );
  const [fitMode, setFitModeState] = useState<FitMode>(
    savedPrefs.fitMode || 'contain'
  );
  const [pageSpread, setPageSpreadState] = useState<PageSpread>(
    savedPrefs.pageSpread || 'single'
  );
  const [brightness, setBrightnessState] = useState<number>(
    savedPrefs.brightness !== undefined ? savedPrefs.brightness : 100
  );
  const [colorFilter, setColorFilterState] = useState<ColorFilter>(
    savedPrefs.colorFilter || 'none'
  );

  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState<string | null>(null);
  const [secondPageUrl, setSecondPageUrl] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Siguiente cómic detectado automáticamente
  const nextComic = useMemo(() => findNextComic(comic, allComics), [comic, allComics]);

  // Setters con persistencia en localStorage
  const setReadingMode = useCallback((mode: ReadingMode) => {
    setReadingModeState(mode);
    savePrefs({ readingMode: mode });
  }, []);

  const setFitMode = useCallback((fit: FitMode) => {
    setFitModeState(fit);
    savePrefs({ fitMode: fit });
  }, []);

  const setPageSpread = useCallback((spread: PageSpread) => {
    setPageSpreadState(spread);
    savePrefs({ pageSpread: spread });
  }, []);

  const setBrightness = useCallback((val: number) => {
    const clamped = Math.max(20, Math.min(100, val));
    setBrightnessState(clamped);
    savePrefs({ brightness: clamped });
  }, []);

  const setColorFilter = useCallback((filter: ColorFilter) => {
    setColorFilterState(filter);
    savePrefs({ colorFilter: filter });
  }, []);

  const toggleFilmstrip = useCallback(() => {
    setIsFilmstripOpen((prev) => !prev);
  }, []);

  // Alternar marcador en la página indicada (o actual)
  const toggleBookmark = useCallback(
    async (targetIndex?: number) => {
      const idx = targetIndex !== undefined ? targetIndex : currentPageIndex;
      const updated = await comicRepository.toggleBookmark(comic.id, idx);
      setBookmarks(updated);
    },
    [comic.id, currentPageIndex]
  );

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
        readerCache.prefetchRange(comic.id, currentPageIndex, comic.totalPages, 4);
      }
    }

    init();

    return () => {
      isCancelled = true;
      readerCache.clearAll();
    };
  }, [comic.id, comic.fileName, currentPageIndex, comic.totalPages]);

  // Cargar página(s) actual(es) y disparar prefetch al cambiar de página o modo doble
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingPage(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });

    const isDoubleActive = pageSpread === 'double' && readingMode !== 'webtoon';
    const needsSecondPage = isDoubleActive && currentPageIndex > 0 && currentPageIndex + 1 < comic.totalPages;

    const promises: Promise<string | null>[] = [
      readerCache.getPageUrl(comic.id, currentPageIndex),
      needsSecondPage ? readerCache.getPageUrl(comic.id, currentPageIndex + 1) : Promise.resolve(null),
    ];

    Promise.all(promises)
      .then(([firstUrl, secondUrl]) => {
        if (!isCancelled) {
          setCurrentPageUrl(firstUrl);
          setSecondPageUrl(secondUrl);
          setIsLoadingPage(false);
          readerCache.prefetchRange(comic.id, currentPageIndex, comic.totalPages, isDoubleActive ? 5 : 3);
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
  }, [comic.id, comic.totalPages, currentPageIndex, pageSpread, readingMode]);

  // Auto-ocultar HUD tras 4 segundos de inactividad
  const resetHudTimer = useCallback(() => {
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      if (!isFilmstripOpen) {
        setIsHudVisible(false);
      }
    }, 4000);
  }, [isFilmstripOpen]);

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
    const isDoubleActive = pageSpread === 'double' && readingMode !== 'webtoon';
    if (isDoubleActive) {
      if (currentPageIndex === 0) {
        goToPage(1);
      } else if (currentPageIndex + 2 < comic.totalPages) {
        goToPage(currentPageIndex + 2);
      } else if (currentPageIndex + 1 < comic.totalPages) {
        goToPage(currentPageIndex + 1);
      }
    } else {
      if (currentPageIndex < comic.totalPages - 1) {
        goToPage(currentPageIndex + 1);
      }
    }
  }, [currentPageIndex, comic.totalPages, goToPage, pageSpread, readingMode]);

  const prevPage = useCallback(() => {
    const isDoubleActive = pageSpread === 'double' && readingMode !== 'webtoon';
    if (isDoubleActive) {
      if (currentPageIndex <= 2) {
        goToPage(0);
      } else {
        goToPage(currentPageIndex - 2);
      }
    } else {
      if (currentPageIndex > 0) {
        goToPage(currentPageIndex - 1);
      }
    }
  }, [currentPageIndex, goToPage, pageSpread, readingMode]);

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
      const isNextKey =
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        e.key === 'l' ||
        e.key === 'L' ||
        e.key === 'j' ||
        e.key === 'J' ||
        e.key === 'MediaTrackNext' ||
        e.key === 'VolumeDown' ||
        e.key === 'AudioVolumeDown';

      const isPrevKey =
        e.key === 'ArrowLeft' ||
        e.key === 'PageUp' ||
        e.key === 'h' ||
        e.key === 'H' ||
        e.key === 'k' ||
        e.key === 'K' ||
        e.key === 'Backspace' ||
        e.key === 'MediaTrackPrevious' ||
        e.key === 'VolumeUp' ||
        e.key === 'AudioVolumeUp';

      if (isNextKey) {
        e.preventDefault();
        if (readingMode === 'rtl') {
          prevPage();
        } else {
          nextPage();
        }
      } else if (isPrevKey) {
        e.preventDefault();
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
      } else if (e.key === 'Home') {
        goToPage(0);
      } else if (e.key === 'End') {
        goToPage(comic.totalPages - 1);
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleFilmstrip();
      } else if (e.key === 'd' || e.key === 'D') {
        setPageSpreadState((prev) => (prev === 'single' ? 'double' : 'single'));
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
  }, [readingMode, nextPage, prevPage, goToPage, comic.totalPages, toggleBookmark, toggleFilmstrip, toggleFullscreen, isFullscreen, onClose]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    currentPageIndex,
    totalPages: comic.totalPages,
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
    showHudTemporarily,
    toggleFullscreen,
    nextPage,
    prevPage,
    goToPage,
    resetZoom,
  };
}
