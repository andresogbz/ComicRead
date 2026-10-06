import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { HomeHero } from './HomeHero';
import { ComicCard } from '../../library/components/ComicCard';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface HomeDashboardProps {
  comics: StoredComic[];
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
  };
  onOpenComic: (comic: StoredComic) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteComic: (id: string, e: React.MouseEvent) => void;
  onPickFiles: () => void;
  onScanDirectory: () => void;
  onGoToLibrary: () => void;
}

const isBook = (item: StoredComic) =>
  item.format === 'epub' || item.format === 'txt' || item.mediaType === 'book';
const isComic = (item: StoredComic) => !isBook(item);

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  comics,
  onOpenComic,
  onToggleFavorite,
  onDeleteComic,
  onPickFiles,
  onGoToLibrary,
}) => {
  const { primaryColor } = useThemeStore();
  const [mediaTab, setMediaTab] = useState<'all' | 'comic' | 'book'>('all');

  // Separación estricta entre cómics y libros
  const comicsList = useMemo(() => comics.filter(isComic), [comics]);
  const booksList = useMemo(() => comics.filter(isBook), [comics]);

  // Ítem destacado para Hero: el más recientemente leído que esté en progreso, o el último añadido
  const heroItem = useMemo(() => {
    if (comics.length === 0) return null;
    const inProgress = comics
      .filter((c) => c.progressPercentage > 0 && c.progressPercentage < 100)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));

    if (inProgress.length > 0) return inProgress[0];
    return comics[0];
  }, [comics]);

  // En progreso diferenciados
  const inProgressComics = useMemo(() => {
    return comicsList.filter(
      (c) => c.progressPercentage > 0 && c.progressPercentage < 100
    );
  }, [comicsList]);

  const inProgressBooks = useMemo(() => {
    return booksList.filter(
      (c) => c.progressPercentage > 0 && c.progressPercentage < 100
    );
  }, [booksList]);

  // Recientemente agregados diferenciados (máx 6)
  const recentComics = useMemo(() => {
    return [...comicsList].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
  }, [comicsList]);

  const recentBooks = useMemo(() => {
    return [...booksList].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
  }, [booksList]);

  // Favoritos diferenciados
  const favComics = useMemo(() => {
    return comicsList.filter((c) => !!c.isFavorite).slice(0, 6);
  }, [comicsList]);

  const favBooks = useMemo(() => {
    return booksList.filter((c) => !!c.isFavorite).slice(0, 6);
  }, [booksList]);

  const showComics = mediaTab === 'all' || mediaTab === 'comic';
  const showBooks = mediaTab === 'all' || mediaTab === 'book';

  return (
    <div className="flex flex-col gap-10 sm:gap-12 pb-24">
      {/* Sección Hero: Continuar Lectura con distinción Cómic vs Libro */}
      <HomeHero
        comic={heroItem}
        onOpenComic={onOpenComic}
        onPickFiles={onPickFiles}
      />

      {/* Selector de medio en el inicio si existen tanto cómics como libros */}
      {comicsList.length > 0 && booksList.length > 0 && (
        <div className="flex items-center gap-7 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
          <button
            type="button"
            onClick={() => setMediaTab('all')}
            className="relative pb-1 text-sm font-semibold transition-colors cursor-pointer"
            style={{
              color: mediaTab === 'all' ? 'var(--text-title)' : 'var(--text-muted)',
            }}
          >
            <span>Todo</span>
            <span className="ml-1.5 text-xs font-normal opacity-80">
              {comics.length}
            </span>
            {mediaTab === 'all' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMediaTab('comic')}
            className="relative pb-1 text-sm font-semibold transition-colors cursor-pointer"
            style={{
              color: mediaTab === 'comic' ? 'var(--text-title)' : 'var(--text-muted)',
            }}
          >
            <span>Cómics</span>
            <span className="ml-1.5 text-xs font-normal opacity-80">
              {comicsList.length}
            </span>
            {mediaTab === 'comic' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMediaTab('book')}
            className="relative pb-1 text-sm font-semibold transition-colors cursor-pointer"
            style={{
              color: mediaTab === 'book' ? 'var(--text-title)' : 'var(--text-muted)',
            }}
          >
            <span>Libros</span>
            <span className="ml-1.5 text-xs font-normal opacity-80">
              {booksList.length}
            </span>
            {mediaTab === 'book' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>
        </div>
      )}

      {/* 1. SECCIÓN: CÓMICS EN CURSO (solo cómics) */}
      {showComics && inProgressComics.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Cómics en curso
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Continuar leyendo cómics
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Ver estantería</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {inProgressComics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. SECCIÓN: LIBROS EN CURSO (solo libros) */}
      {showBooks && inProgressBooks.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Libros en curso
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Continuar lectura de libros
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Ver estantería</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {inProgressBooks.map((book) => (
              <ComicCard
                key={book.id}
                comic={book}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. SECCIÓN: CÓMICS RECIENTES */}
      {showComics && recentComics.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Colección gráfica
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Cómics recientes
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Ver catálogo</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {recentComics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. SECCIÓN: LIBROS Y NOVELAS RECIENTES */}
      {showBooks && recentBooks.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Biblioteca literaria
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Libros y novelas recientes
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLibrary}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Ver catálogo</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {recentBooks.map((book) => (
              <ComicCard
                key={book.id}
                comic={book}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. FAVORITOS (diferenciados si existen) */}
      {showComics && favComics.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Destacados
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Cómics favoritos
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {favComics.map((comic) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}

      {showBooks && favBooks.length > 0 && (
        <section className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/40 dark:border-zinc-800/40 transition-colors">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: primaryColor.hex }}
              >
                Destacados
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight m-0 mt-1"
                style={{ color: 'var(--text-title)' }}
              >
                Libros favoritos
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {favBooks.map((book) => (
              <ComicCard
                key={book.id}
                comic={book}
                onOpen={onOpenComic}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteComic}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
