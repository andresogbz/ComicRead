import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { ComicCard } from './ComicCard';
import { EmptyLibraryState } from './EmptyLibraryState';
import { LibrarySkeleton } from './LibrarySkeleton';
import { LibraryHeader } from './LibraryHeader';
import { LibraryFilterBar } from './LibraryFilterBar';
import { useLibrary } from '../hooks/useLibrary';
import { useDirectoryScanner } from '../hooks/useDirectoryScanner';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface LibraryGridProps {
  onOpenComic: (comic: StoredComic) => void;
  onPickFiles?: () => void;
  onScanDirectory?: () => void;
  isScanning?: boolean;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  onOpenComic,
  onPickFiles: customPickFiles,
  onScanDirectory: customScanDirectory,
  isScanning: customIsScanning,
}) => {
  const {
    comics,
    allComicsCount,
    isLoading,
    importProgress: _importProgress,
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
  } = useLibrary();

  const internalScanner = useDirectoryScanner(importFiles);
  const pickFiles = customPickFiles || internalScanner.pickFiles;
  const scanDirectory = customScanDirectory || internalScanner.scanDirectory;
  const isScanning = customIsScanning !== undefined ? customIsScanning : internalScanner.isScanning;

  const { primaryColor } = useThemeStore();

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
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 w-full max-w-full overflow-x-hidden pb-24">
      {/* Panel de control de biblioteca con fondo distintivo */}
      <div className="p-5 sm:p-7 rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 shadow-xl transition-all mb-6">
        <LibraryHeader
          totalComics={allComicsCount}
          onPickFiles={pickFiles}
          onScanDirectory={scanDirectory}
          isScanning={isScanning}
        />

        {/* Barra de Filtros y Búsqueda */}
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
      </div>

      {/* Banner de error visible si falla una importación */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 px-4 py-3 text-rose-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span className="text-xs font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors"
            aria-label="Cerrar mensaje de error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Estado de Carga */}
      {isLoading ? (
        <LibrarySkeleton />
      ) : allComicsCount === 0 ? (
        <div className="rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 p-6 sm:p-12">
          <EmptyLibraryState
            onPickFiles={pickFiles}
            onScanDirectory={scanDirectory}
            onFilesDropped={importFiles}
          />
        </div>
      ) : comics.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center rounded-3xl bg-black/60 dark:bg-black/70 backdrop-blur-md border border-white/10 p-8">
          <p className="text-sm text-zinc-300">
            No se encontraron cómics que coincidan con la búsqueda o filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="mt-3 text-xs underline underline-offset-4 font-bold transition-colors"
            style={{ color: primaryColor.hex }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* Cuadrícula de Cómics */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
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
    </div>
  );
};
