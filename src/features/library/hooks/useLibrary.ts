import { useMemo, useEffect } from 'react';
import { useLibraryStore } from '../stores/useLibraryStore';

export function useLibrary() {
  const {
    comics,
    isLoading,
    importProgress,
    errorMessage,
    searchQuery,
    filterStatus,
    selectedCollection,
    sortBy,
    loadLibrary,
    importFiles,
    toggleFavorite,
    toggleBookmark,
    updateComicCollection,
    deleteComic,
    setSearchQuery,
    setFilterStatus,
    setSelectedCollection,
    setSortBy,
    clearError,
  } = useLibraryStore();

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Lista única de colecciones existentes en la biblioteca
  const collections = useMemo(() => {
    const set = new Set<string>();
    for (const c of comics) {
      if (c.collection) set.add(c.collection);
      else if (c.series) set.add(c.series);
    }
    return Array.from(set).sort();
  }, [comics]);

  const filteredComics = useMemo(() => {
    let result = [...comics];

    // Filtro por colección activa
    if (selectedCollection) {
      result = result.filter(
        (c) => c.collection === selectedCollection || c.series === selectedCollection
      );
    }

    // Búsqueda por texto (título, archivo o colección)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.fileName.toLowerCase().includes(q) ||
          (c.collection && c.collection.toLowerCase().includes(q)) ||
          (c.series && c.series.toLowerCase().includes(q))
      );
    }

    // Filtros de estado
    switch (filterStatus) {
      case 'in_progress':
        result = result.filter(
          (c) => c.progressPercentage > 0 && c.progressPercentage < 100
        );
        break;
      case 'unread':
        result = result.filter((c) => c.progressPercentage === 0);
        break;
      case 'completed':
        result = result.filter((c) => c.progressPercentage >= 100);
        break;
      case 'favorites':
        result = result.filter((c) => !!c.isFavorite);
        break;
      case 'bookmarks':
        result = result.filter((c) => (c.bookmarks?.length || 0) > 0);
        break;
      case 'all':
      default:
        break;
    }

    // Ordenación
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
        case 'progress':
          return b.progressPercentage - a.progressPercentage;
        case 'recent':
        default: {
          const timeA = a.lastReadAt || a.addedAt;
          const timeB = b.lastReadAt || b.addedAt;
          return timeB - timeA;
        }
      }
    });

    return result;
  }, [comics, selectedCollection, searchQuery, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const total = comics.length;
    const inProgress = comics.filter(
      (c) => c.progressPercentage > 0 && c.progressPercentage < 100
    ).length;
    const completed = comics.filter((c) => c.progressPercentage >= 100).length;
    const favorites = comics.filter((c) => !!c.isFavorite).length;
    const bookmarksCount = comics.filter((c) => (c.bookmarks?.length || 0) > 0).length;

    return { total, inProgress, completed, favorites, bookmarksCount };
  }, [comics]);

  return {
    comics: filteredComics,
    allComics: comics,
    allComicsCount: comics.length,
    collections,
    selectedCollection,
    isLoading,
    importProgress,
    errorMessage,
    searchQuery,
    filterStatus,
    sortBy,
    stats,
    importFiles,
    toggleFavorite,
    toggleBookmark,
    updateComicCollection,
    deleteComic,
    setSearchQuery,
    setFilterStatus,
    setSelectedCollection,
    setSortBy,
    clearError,
  };
}
