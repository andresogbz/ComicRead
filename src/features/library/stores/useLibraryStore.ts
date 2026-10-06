import { create } from 'zustand';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { comicFileService } from '../services/comicFileService';
import { bookFileService } from '../../bookReader/services/bookFileService';
import { pdfService } from '../../reader/services/pdfService';
import { backupService } from '../../settings/services/backupService';

export type FilterStatus = 'all' | 'in_progress' | 'unread' | 'completed' | 'favorites' | 'bookmarks';
export type SortOption = 'recent' | 'title' | 'progress';
export type MediaFilter = 'all' | 'comic' | 'book';

export interface ImportProgress {
  current: number;
  total: number;
  currentFileName: string;
}

interface LibraryState {
  comics: StoredComic[];
  isLoading: boolean;
  importProgress: ImportProgress | null;
  errorMessage: string | null;
  searchQuery: string;
  filterStatus: FilterStatus;
  mediaFilter: MediaFilter;
  selectedCollection: string | null;
  sortBy: SortOption;
  selectedComic: StoredComic | null;

  // Acciones
  loadLibrary: () => Promise<void>;
  importFiles: (files: File[]) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleBookmark: (id: string, pageIndex: number) => Promise<void>;
  updateComicCollection: (id: string, collection: string | undefined) => Promise<void>;
  deleteComic: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setMediaFilter: (mediaFilter: MediaFilter) => void;
  setSelectedCollection: (collection: string | null) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedComic: (comic: StoredComic | null) => void;
  clearError: () => void;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  comics: [],
  isLoading: true,
  importProgress: null,
  errorMessage: null,
  searchQuery: '',
  filterStatus: 'all',
  mediaFilter: 'all',
  selectedCollection: null,
  sortBy: 'recent',
  selectedComic: null,

  loadLibrary: async () => {
    try {
      set({ isLoading: true });
      const comics = await comicRepository.getAllComics();
      set({ comics, isLoading: false });
    } catch (error) {
      console.error('[useLibraryStore] Error cargando biblioteca:', error);
      set({ isLoading: false });
    }
  },

  importFiles: async (files: File[]) => {
    if (!files.length) return;

    set({
      errorMessage: null,
      importProgress: {
        current: 0,
        total: files.length,
        currentFileName: files[0].name,
      },
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      set({
        importProgress: {
          current: i + 1,
          total: files.length,
          currentFileName: file.name,
        },
      });

      try {
        const lowerName = file.name.toLowerCase();
        const isBook = lowerName.endsWith('.epub') || lowerName.endsWith('.txt');

        const isPdf = lowerName.endsWith('.pdf');

        if (isBook) {
          const { metadata, coverUrl } = await bookFileService.processBookFile(file);
          const storedComic: StoredComic = {
            ...metadata,
            coverDataUrl: coverUrl,
          };
          await comicRepository.saveComic(storedComic, file);
        } else if (isPdf) {
          const { metadata, coverUrl } = await pdfService.processPdfFile(file);
          const storedComic: StoredComic = {
            ...metadata,
            coverDataUrl: coverUrl,
          };
          await comicRepository.saveComic(storedComic, file);
        } else {
          const { metadata, archiveInfo } =
            await comicFileService.processComicFile(file);

          let coverDataUrl: string | undefined;
          if (archiveInfo.coverBuffer && archiveInfo.coverMimeType) {
            const coverBlob = new Blob([archiveInfo.coverBuffer], {
              type: archiveInfo.coverMimeType,
            });
            coverDataUrl = await blobToDataUrl(coverBlob);
          }

          const storedComic: StoredComic = {
            ...metadata,
            coverDataUrl,
          };

          await comicRepository.saveComic(storedComic, file);
        }
      } catch (err: any) {
        console.error(`Error procesando archivo ${file.name}:`, err);
        set({
          errorMessage: `No se pudo importar "${file.name}": ${err?.message || 'Archivo no compatible o formato dañado'}.`,
        });
      }
    }

    set({ importProgress: null });
    await get().loadLibrary();
    // Programar auto-respaldo inmediato en Documents/Gomic
    backupService.scheduleAutoBackup();
  },

  toggleFavorite: async (id: string) => {
    await comicRepository.toggleFavorite(id);
    set((state) => ({
      comics: state.comics.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      ),
    }));
    backupService.scheduleAutoBackup();
  },

  toggleBookmark: async (id: string, pageIndex: number) => {
    const updatedBookmarks = await comicRepository.toggleBookmark(id, pageIndex);
    set((state) => ({
      comics: state.comics.map((c) =>
        c.id === id ? { ...c, bookmarks: updatedBookmarks } : c
      ),
    }));
    backupService.scheduleAutoBackup();
  },

  updateComicCollection: async (id: string, collection: string | undefined) => {
    await comicRepository.updateCollection(id, collection);
    set((state) => ({
      comics: state.comics.map((c) =>
        c.id === id ? { ...c, collection, series: collection } : c
      ),
    }));
    backupService.scheduleAutoBackup();
  },

  deleteComic: async (id: string) => {
    await comicRepository.deleteComic(id);
    set((state) => ({
      comics: state.comics.filter((c) => c.id !== id),
      selectedComic: state.selectedComic?.id === id ? null : state.selectedComic,
    }));
    backupService.scheduleAutoBackup();
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setFilterStatus: (filterStatus: FilterStatus) => set({ filterStatus }),
  setMediaFilter: (mediaFilter: MediaFilter) => set({ mediaFilter }),
  setSelectedCollection: (selectedCollection: string | null) => set({ selectedCollection }),
  setSortBy: (sortBy: SortOption) => set({ sortBy }),
  setSelectedComic: (selectedComic: StoredComic | null) => set({ selectedComic }),
  clearError: () => set({ errorMessage: null }),
}));
