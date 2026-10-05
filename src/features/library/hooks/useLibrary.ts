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
    sortBy,
    loadLibrary,
    importFiles,
    toggleFavorite,
    deleteComic,
    setSearchQuery,
    setFilterStatus,
    setSortBy,
    clearError,
  } = useLibraryStore();

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const filteredComics = useMemo(() => {
    let result = [...comics];

    // Búsqueda por texto (título o nombre de archivo)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.fileName.toLowerCase().includes(q) ||
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
      case 'all':
      default:
        break;
    }

    // Ordenación
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
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
  }, [comics, searchQuery, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const total = comics.length;
    const inProgress = comics.filter(
      (c) => c.progressPercentage > 0 && c.progressPercentage < 100
    ).length;
    const completed = comics.filter((c) => c.progressPercentage >= 100).length;
    const favorites = comics.filter((c) => !!c.isFavorite).length;

    return { total, inProgress, completed, favorites };
  }, [comics]);

  return {
    comics: filteredComics,
    allComicsCount: comics.length,
    isLoading,
    importProgress,
    errorMessage,
    searchQuery,
    filterStatus,
    sortBy,
    stats,
    importFiles,
    toggleFavorite,
    deleteComic,
    setSearchQuery,
    setFilterStatus,
    setSortBy,
    clearError,
  };
}
