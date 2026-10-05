import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type {
  FilterStatus,
  SortOption,
} from '../stores/useLibraryStore';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface LibraryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
  };
}

const FILTER_ITEMS: { id: FilterStatus; label: string; countKey?: 'total' | 'inProgress' | 'completed' | 'favorites' }[] = [
  { id: 'all', label: 'Todos', countKey: 'total' },
  { id: 'in_progress', label: 'En progreso', countKey: 'inProgress' },
  { id: 'unread', label: 'No leídos' },
  { id: 'completed', label: 'Completados', countKey: 'completed' },
  { id: 'favorites', label: 'Favoritos', countKey: 'favorites' },
];

export const LibraryFilterBar: React.FC<LibraryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  stats,
}) => {
  const { primaryColor } = useThemeStore();

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Chips de filtro sin ningún scroll horizontal */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_ITEMS.map((item) => {
            const isActive = filterStatus === item.id;
            const count = item.countKey ? stats[item.countKey] : undefined;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange(item.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'font-semibold text-white shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: primaryColor.hex,
                        boxShadow: `0 2px 10px ${primaryColor.glow}`,
                      }
                    : undefined
                }
              >
                <span>{item.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-black/10 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador y Selector de Ordenación sin bordes */}
        <div className="flex items-center gap-2.5">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cómic o serie..."
              className="h-8 w-full rounded-full bg-black/5 dark:bg-white/5 pl-9 pr-8 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-all"
              style={{
                outlineColor: primaryColor.hex,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Selector de ordenación */}
          <div className="relative flex items-center">
            <div className="flex h-8 items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-3 text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer pr-1"
                aria-label="Ordenar cómics"
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
        </div>
      </div>
    </div>
  );
};

