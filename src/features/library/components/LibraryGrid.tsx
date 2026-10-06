import React, { useMemo } from 'react';
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

const isBook = (item: StoredComic) =>
  item.format === 'epub' || item.format === 'txt' || item.mediaType === 'book';
const isComic = (item: StoredComic) => !isBook(item);

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  onOpenComic,
  onPickFiles: customPickFiles,
  onScanDirectory: customScanDirectory,
  isScanning: customIsScanning,
}) => {
  const {
    comics,
    allComicsCount,
    collections,
    selectedCollection,
    isLoading,
    importProgress: _importProgress,
    errorMessage,
    searchQuery,
    filterStatus,
    mediaFilter,
    sortBy,
    stats,
    importFiles,
    toggleFavorite,
    updateComicCollection,
    deleteComic,
    setSearchQuery,
    setFilterStatus,
    setMediaFilter,
    setSelectedCollection,
    setSortBy,
    clearError,
  } = useLibrary();

  const internalScanner = useDirectoryScanner(importFiles);
  const pickFiles = customPickFiles || internalScanner.pickFiles;
  const scanDirectory = customScanDirectory || internalScanner.scanDirectory;
  const isScanning = customIsScanning !== undefined ? customIsScanning : internalScanner.isScanning;

  const { primaryColor } = useThemeStore();

  const comicsSection = useMemo(() => comics.filter(isComic), [comics]);
  const booksSection = useMemo(() => comics.filter(isBook), [comics]);

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
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 w-full max-w-full overflow-x-hidden">
      {/* Encabezado */}
      <LibraryHeader
        totalComics={allComicsCount}
        onPickFiles={pickFiles}
        onScanDirectory={scanDirectory}
        isScanning={isScanning}
      />

      {/* Banner de error visible si falla una importación sin bordes */}
      {errorMessage && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-rose-500/10 px-4 py-3 text-rose-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span className="text-xs font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            aria-label="Cerrar mensaje de error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda (sin saturación de pills) */}
      {allComicsCount > 0 && (
        <LibraryFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          mediaFilter={mediaFilter}
          onMediaFilterChange={setMediaFilter}
          collections={collections}
          selectedCollection={selectedCollection}
          onCollectionChange={setSelectedCollection}
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No se encontraron historias que coincidan con la búsqueda o filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setSelectedCollection(null);
            }}
            className="mt-3 text-xs underline underline-offset-4 font-medium transition-colors cursor-pointer"
            style={{ color: primaryColor.hex }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : mediaFilter === 'all' && comicsSection.length > 0 && booksSection.length > 0 ? (
        /* Diferenciación en secciones separadas cuando coexisten cómics y libros */
        <div className="flex flex-col gap-10 mt-2">
          {/* Sección de Cómics */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white m-0">
                Cómics
              </h2>
              <span className="text-xs text-zinc-500 font-normal">({comicsSection.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {comicsSection.map((comic) => (
                <ComicCard
                  key={comic.id}
                  comic={comic}
                  existingCollections={collections}
                  onOpen={onOpenComic}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteComic}
                  onUpdateCollection={updateComicCollection}
                />
              ))}
            </div>
          </div>

          {/* Sección de Libros */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white m-0">
                Libros
              </h2>
              <span className="text-xs text-zinc-500 font-normal">({booksSection.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {booksSection.map((book) => (
                <ComicCard
                  key={book.id}
                  comic={book}
                  existingCollections={collections}
                  onOpen={onOpenComic}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteComic}
                  onUpdateCollection={updateComicCollection}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Cuadrícula única filtrada */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mt-4">
          {comics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              existingCollections={collections}
              onOpen={onOpenComic}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteComic}
              onUpdateCollection={updateComicCollection}
            />
          ))}
        </div>
      )}
    </div>
  );
};
