import React from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { ComicCard } from './ComicCard';
import { EmptyLibraryState } from './EmptyLibraryState';
import { LibrarySkeleton } from './LibrarySkeleton';
import { LibraryHeader } from './LibraryHeader';
import { LibraryFilterBar } from './LibraryFilterBar';
import { ImportProgressModal } from './ImportProgressModal';
import { useLibrary } from '../hooks/useLibrary';
import { useDirectoryScanner } from '../hooks/useDirectoryScanner';

interface LibraryGridProps {
  onOpenComic: (comic: StoredComic) => void;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({ onOpenComic }) => {
  const {
    comics,
    allComicsCount,
    isLoading,
    importProgress,
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
  } = useLibrary();

  const { isScanning, scanDirectory, pickFiles } =
    useDirectoryScanner(importFiles);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const handleDeleteComic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este cómic de la biblioteca?')) {
      deleteComic(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Encabezado */}
      <LibraryHeader
        totalComics={allComicsCount}
        onPickFiles={pickFiles}
        onScanDirectory={scanDirectory}
        isScanning={isScanning}
      />

      {/* Barra de Filtros y Búsqueda (si hay cómics) */}
      {allComicsCount > 0 && (
        <LibraryFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          stats={stats}
        />
      )}

      {/* Estado de Carga */}
      {isLoading ? (
        <LibrarySkeleton />
      ) : allComicsCount === 0 ? (
        <EmptyLibraryState
          onPickFiles={pickFiles}
          onScanDirectory={scanDirectory}
          onFilesDropped={importFiles}
        />
      ) : comics.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <p className="text-sm text-zinc-400">
            No se encontraron cómics que coincidan con la búsqueda o filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* Cuadrícula de Cómics */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mt-4">
          {comics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onOpen={onOpenComic}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteComic}
            />
          ))}
        </div>
      )}

      {/* Indicador de importación en background */}
      {importProgress && <ImportProgressModal progress={importProgress} />}
    </div>
  );
};
