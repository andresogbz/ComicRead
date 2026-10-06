import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { db, type StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore, PRIMARY_COLORS } from '../../../core/theme/useThemeStore';

export interface GomicBackup {
  version: 1;
  exportedAt: number;
  appName: 'Gomic';
  comics: Array<Omit<StoredComic, 'coverDataUrl'> & { coverDataUrl?: string }>;
  preferences: {
    themeMode: 'light' | 'dark';
    primaryColorId: string;
    readerPrefs?: Record<string, any>;
  };
}

export class BackupService {
  /**
   * Genera y descarga un archivo JSON ligero con todo el progreso, colecciones y marcadores.
   */
  public async exportBackup(): Promise<void> {
    const allComics = await comicRepository.getAllComics();
    const { mode, primaryColor } = useThemeStore.getState();

    let readerPrefs: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('gomic_reader_preferences');
      if (raw) readerPrefs = JSON.parse(raw);
    } catch {
      // Ignorar
    }

    const backupData: GomicBackup = {
      version: 1,
      exportedAt: Date.now(),
      appName: 'Gomic',
      comics: allComics.map((c) => ({
        ...c,
        // Mantener coverDataUrl solo si es compacta para no inflar el JSON
        coverDataUrl: c.coverDataUrl && c.coverDataUrl.length < 200000 ? c.coverDataUrl : undefined,
      })),
      preferences: {
        themeMode: mode,
        primaryColorId: primaryColor.id,
        readerPrefs,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `gomic-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa y restaura una copia de seguridad desde un archivo JSON.
   */
  public async importBackup(file: File): Promise<{
    restoredCount: number;
    updatedCount: number;
  }> {
    const text = await file.text();
    let data: GomicBackup;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('El archivo seleccionado no es un formato JSON válido.');
    }

    if (!data.appName || !Array.isArray(data.comics)) {
      throw new Error('El archivo no corresponde a una copia de seguridad válida de Gomic.');
    }

    let restoredCount = 0;
    let updatedCount = 0;

    await db.transaction('rw', db.comics, async () => {
      for (const comic of data.comics) {
        const existing = await db.comics.get(comic.id);

        if (existing) {
          // Si ya existe, actualiza su progreso, colección, marcadores y favorito
          await db.comics.update(comic.id, {
            lastReadPageIndex: comic.lastReadPageIndex,
            progressPercentage: comic.progressPercentage,
            lastReadAt: comic.lastReadAt || existing.lastReadAt,
            collection: comic.collection || existing.collection,
            series: comic.series || existing.series,
            bookmarks: comic.bookmarks || existing.bookmarks,
            isFavorite: comic.isFavorite !== undefined ? comic.isFavorite : existing.isFavorite,
          });
          updatedCount++;
        } else {
          // Si no existe aún en la base de datos, guardar registro para vincular con archivo futuro
          await db.comics.put(comic as StoredComic);
          restoredCount++;
        }
      }
    });

    // Restaurar preferencias
    if (data.preferences) {
      if (data.preferences.primaryColorId) {
        const foundColor = PRIMARY_COLORS.find(
          (c) => c.id === data.preferences.primaryColorId
        );
        if (foundColor) {
          useThemeStore.getState().setPrimaryColor(foundColor);
        }
      }

      if (data.preferences.readerPrefs) {
        try {
          localStorage.setItem(
            'gomic_reader_preferences',
            JSON.stringify(data.preferences.readerPrefs)
          );
        } catch {
          // Ignorar
        }
      }
    }

    return { restoredCount, updatedCount };
  }
}

export const backupService = new BackupService();
