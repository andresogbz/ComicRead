import React from 'react';
import { Search, X, ArrowUpDown, Folder, Bookmark } from 'lucide-react';
import type {
  FilterStatus,
  SortOption,
  MediaFilter,
} from '../stores/useLibraryStore';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface LibraryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  mediaFilter?: MediaFilter;
  onMediaFilterChange?: (media: MediaFilter) => void;
  collections?: string[];
  selectedCollection?: string | null;
  onCollectionChange?: (collection: string | null) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
    bookmarksCount?: number;
    comicsCount?: number;
    booksCount?: number;
  };
}

const STATUS_ITEMS: {
  id: FilterStatus;
  label: string;
  countKey?: 'total' | 'inProgress' | 'completed' | 'favorites' | 'bookmarksCount';
}[] = [
  { id: 'all', label: 'Todos' },
  { id: 'in_progress', label: 'En progreso', countKey: 'inProgress' },
  { id: 'unread', label: 'No leídos' },
  { id: 'completed', label: 'Completados', countKey: 'completed' },
  { id: 'favorites', label: 'Favoritos', countKey: 'favorites' },
  { id: 'bookmarks', label: 'Marcadores', countKey: 'bookmarksCount' },
];

export const LibraryFilterBar: React.FC<LibraryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  mediaFilter = 'all',
  onMediaFilterChange,
  collections = [],
  selectedCollection = null,
  onCollectionChange,
  sortBy,
  onSortChange,
  stats,
}) => {
  const { primaryColor } = useThemeStore();

  return (
    <div className="flex flex-col gap-4 pt-1 pb-5 mb-4 select-none">
      {/* 1. Selector de Medio Minimalista (Tabs limpios con línea sutil) */}
      {onMediaFilterChange && (
        <div className="flex items-center gap-7 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
          <button
            type="button"
            onClick={() => onMediaFilterChange('all')}
            className={`relative pb-1 text-sm font-semibold transition-colors cursor-pointer ${
              mediaFilter === 'all'
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <span>Todo</span>
            <span className="ml-1.5 text-xs text-zinc-500 font-normal">
              {stats.total}
            </span>
            {mediaFilter === 'all' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onMediaFilterChange('comic')}
            className={`relative pb-1 text-sm font-semibold transition-colors cursor-pointer ${
              mediaFilter === 'comic'
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <span>Cómics</span>
            {typeof stats.comicsCount === 'number' && (
              <span className="ml-1.5 text-xs text-zinc-500 font-normal">
                {stats.comicsCount}
              </span>
            )}
            {mediaFilter === 'comic' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onMediaFilterChange('book')}
            className={`relative pb-1 text-sm font-semibold transition-colors cursor-pointer ${
              mediaFilter === 'book'
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <span>Libros</span>
            {typeof stats.booksCount === 'number' && (
              <span className="ml-1.5 text-xs text-zinc-500 font-normal">
                {stats.booksCount}
              </span>
            )}
            {mediaFilter === 'book' && (
              <div
                className="absolute -bottom-[11px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primaryColor.hex }}
              />
            )}
          </button>
        </div>
      )}

      {/* 2. Barra de Búsqueda y Ordenación en una sola fila compacta */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cómic, libro o saga..."
            className="h-8.5 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/60 pl-9 pr-8 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex h-8.5 items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 px-3 text-xs text-zinc-700 dark:text-zinc-300 transition-colors shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer pr-1"
            aria-label="Ordenar biblioteca"
          >
            <option value="recent" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              Recientes
            </option>
            <option value="title" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              Título
            </option>
            <option value="progress" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              Progreso
            </option>
          </select>
        </div>
      </div>

      {/* 3. Filtros de Estado en Fila Única Desplazable (CERO saturación de múltiples líneas) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap py-0.5">
        {STATUS_ITEMS.map((item) => {
          const isActive = filterStatus === item.id;
          const count = item.countKey ? stats[item.countKey] : undefined;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
              }`}
            >
              {item.id === 'bookmarks' && (
                <Bookmark className="h-3 w-3 stroke-[2]" />
              )}
              <span>{item.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] ${
                    isActive ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Sagas si existen (Fila única desplazable) */}
      {collections.length > 0 && onCollectionChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap text-xs pt-1 border-t border-zinc-200/30 dark:border-zinc-800/30">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-medium shrink-0 mr-1">
            <Folder className="h-3 w-3 stroke-[2]" />
            Sagas:
          </span>

          <button
            type="button"
            onClick={() => onCollectionChange(null)}
            className={`px-2.5 py-0.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
              selectedCollection === null
                ? 'font-medium text-zinc-900 dark:text-white'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            Todas
          </button>

          {collections.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => onCollectionChange(selectedCollection === col ? null : col)}
              className={`px-2.5 py-0.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                selectedCollection === col
                  ? 'font-medium text-zinc-900 dark:text-white underline'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
