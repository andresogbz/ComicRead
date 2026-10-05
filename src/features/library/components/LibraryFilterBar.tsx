import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type {
  FilterStatus,
  SortOption,
} from '../stores/useLibraryStore';

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
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Chips de filtro horizontal */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {FILTER_ITEMS.map((item) => {
            const isActive = filterStatus === item.id;
            const count = item.countKey ? stats[item.countKey] : undefined;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/[0.06]'
                }`}
              >
                <span>{item.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive
                        ? 'bg-zinc-300 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador y Selector de Ordenación */}
        <div className="flex items-center gap-2.5">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cómic o serie..."
              className="h-8 w-full rounded-full bg-zinc-900/90 pl-9 pr-8 text-xs text-zinc-200 placeholder-zinc-500 border border-white/[0.08] focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Selector de ordenación */}
          <div className="relative flex items-center">
            <div className="flex h-8 items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 text-xs text-zinc-300 border border-white/[0.08]">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer pr-1"
                aria-label="Ordenar cómics"
              >
                <option value="recent" className="bg-zinc-900 text-zinc-200">
                  Recientes
                </option>
                <option value="title" className="bg-zinc-900 text-zinc-200">
                  Título
                </option>
                <option value="progress" className="bg-zinc-900 text-zinc-200">
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
