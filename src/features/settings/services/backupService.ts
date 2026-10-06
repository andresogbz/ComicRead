import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
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

const BACKUP_DOCUMENTS_PATH = 'Gomic/gomic_backup.json';
const LOCAL_MIRROR_KEY = 'gomic_autobackup_mirror';

export class BackupService {
  private autoBackupTimer: any = null;

  /**
   * Construye el paquete completo de respaldo con el estado actual
   */
  public async buildBackupData(): Promise<GomicBackup> {
    const allComics = await comicRepository.getAllComics();
    const { mode, primaryColor } = useThemeStore.getState();

    let readerPrefs: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('gomic_reader_preferences');
      if (raw) readerPrefs = JSON.parse(raw);
    } catch {
      // Ignorar errores de parseo
    }

    return {
      version: 1,
      exportedAt: Date.now(),
      appName: 'Gomic',
      comics: allComics.map((c) => ({
        ...c,
        // Conservar portadas pequeñas para no inflar innecesariamente el respaldo
        coverDataUrl:
          c.coverDataUrl && c.coverDataUrl.length < 200000
            ? c.coverDataUrl
            : undefined,
      })),
      preferences: {
        themeMode: mode,
        primaryColorId: primaryColor.id,
        readerPrefs,
      },
    };
  }

  /**
   * Genera y descarga un archivo JSON manual con todo el progreso, sagas, resaltados y notas.
   */
  public async exportBackup(): Promise<void> {
    const backupData = await this.buildBackupData();
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

    // Aprovechar para sincronizar también en Documents
    await this.saveAutoBackupToDocuments(backupData).catch(() => {});
  }

  /**
   * Guarda automáticamente una copia de seguridad en la carpeta Documents/Gomic del dispositivo.
   * Este archivo sobrevive a desinstalaciones de la aplicación en Android.
   */
  public async saveAutoBackupToDocuments(dataOverride?: GomicBackup): Promise<boolean> {
    try {
      const backupData = dataOverride || (await this.buildBackupData());
      const jsonString = JSON.stringify(backupData, null, 2);

      // 1. Guardar siempre en espejo local de respaldo
      try {
        localStorage.setItem(LOCAL_MIRROR_KEY, jsonString);
        localStorage.setItem('gomic_last_autobackup_time', String(Date.now()));
      } catch {
        // Fallback si quota excedida
      }

      // 2. Guardar en almacenamiento externo persistente mediante Capacitor Filesystem
      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: BACKUP_DOCUMENTS_PATH,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
      }

      return true;
    } catch (err) {
      console.warn('[BackupService] No se pudo escribir auto-backup en Documents:', err);
      return false;
    }
  }

  /**
   * Programa un auto-respaldo con rebote (debounce) para no saturar I/O.
   */
  public scheduleAutoBackup(delayMs = 2000): void {
    if (this.autoBackupTimer) {
      clearTimeout(this.autoBackupTimer);
    }

    this.autoBackupTimer = setTimeout(() => {
      this.saveAutoBackupToDocuments().catch((err) => {
        console.warn('[BackupService] Error en respaldo programado:', err);
      });
    }, delayMs);
  }

  /**
   * Comprueba si existe un respaldo persistente en Documents/Gomic o espejo local.
   */
  public async checkStorageBackupExists(): Promise<{
    exists: boolean;
    date?: number;
    comicsCount?: number;
    source: 'documents' | 'local' | 'none';
  }> {
    if (Capacitor.isNativePlatform()) {
      try {
        const stat = await Filesystem.stat({
          path: BACKUP_DOCUMENTS_PATH,
          directory: Directory.Documents,
        });

        if (stat) {
          const res = await Filesystem.readFile({
            path: BACKUP_DOCUMENTS_PATH,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          const content = typeof res.data === 'string' ? res.data : await (res.data as Blob).text();
          const parsed: GomicBackup = JSON.parse(content);
          return {
            exists: true,
            date: parsed.exportedAt || stat.mtime,
            comicsCount: parsed.comics?.length || 0,
            source: 'documents',
          };
        }
      } catch {
        // Archivo aún no existe en Documents
      }
    }

    // Comprobar espejo local
    try {
      const localRaw = localStorage.getItem(LOCAL_MIRROR_KEY);
      if (localRaw) {
        const parsed: GomicBackup = JSON.parse(localRaw);
        return {
          exists: true,
          date: parsed.exportedAt,
          comicsCount: parsed.comics?.length || 0,
          source: 'local',
        };
      }
    } catch {
      // Ignorar
    }

    return { exists: false, source: 'none' };
  }

  /**
   * Restaura la base de datos a partir del respaldo almacenado en Documents/Gomic o espejo local.
   */
  public async restoreFromStorageBackup(): Promise<{
    restoredCount: number;
    updatedCount: number;
  }> {
    let jsonString: string | null = null;

    if (Capacitor.isNativePlatform()) {
      try {
        const res = await Filesystem.readFile({
          path: BACKUP_DOCUMENTS_PATH,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        jsonString = typeof res.data === 'string' ? res.data : await (res.data as Blob).text();
      } catch (err) {
        console.warn('[BackupService] No se encontró archivo en Documents:', err);
      }
    }

    if (!jsonString) {
      jsonString = localStorage.getItem(LOCAL_MIRROR_KEY);
    }

    if (!jsonString) {
      throw new Error('No se encontró ninguna copia de seguridad en Documents/Gomic ni en el almacenamiento local.');
    }

    const data: GomicBackup = JSON.parse(jsonString);
    return this.restoreFromBackupData(data);
  }

  /**
   * Restaura la base de datos desde un archivo JSON subido por el usuario.
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

    return this.restoreFromBackupData(data);
  }

  /**
   * Procesa y restaura el objeto GomicBackup en la base de datos local y preferencias.
   */
  public async restoreFromBackupData(data: GomicBackup): Promise<{
    restoredCount: number;
    updatedCount: number;
  }> {
    if (!data.appName || !Array.isArray(data.comics)) {
      throw new Error('El archivo no corresponde a una copia de seguridad válida de Gomic.');
    }

    let restoredCount = 0;
    let updatedCount = 0;

    await db.transaction('rw', db.comics, async () => {
      for (const comic of data.comics) {
        const existing = await db.comics.get(comic.id);

        if (existing) {
          // Si ya existe, actualiza su progreso, colección, marcadores, resaltados y favorito
          await db.comics.update(comic.id, {
            lastReadPageIndex: comic.lastReadPageIndex,
            progressPercentage: comic.progressPercentage,
            lastReadAt: comic.lastReadAt || existing.lastReadAt,
            collection: comic.collection || existing.collection,
            series: comic.series || existing.series,
            bookmarks: comic.bookmarks || existing.bookmarks,
            highlights: comic.highlights || existing.highlights,
            mediaType: comic.mediaType || existing.mediaType,
            format: comic.format || existing.format,
            isFavorite: comic.isFavorite !== undefined ? comic.isFavorite : existing.isFavorite,
          });
          updatedCount++;
        } else {
          // Si no existe aún en la base de datos, guardar registro completo
          await db.comics.put(comic as StoredComic);
          restoredCount++;
        }
      }
    });

    // Restaurar preferencias visuales
    if (data.preferences) {
      if (data.preferences.primaryColorId) {
        const foundColor = PRIMARY_COLORS.find(
          (c) => c.id === data.preferences.primaryColorId
        );
        if (foundColor) {
          useThemeStore.getState().setPrimaryColor(foundColor);
        }
      }

      if (data.preferences.themeMode) {
        const currentMode = useThemeStore.getState().mode;
        if (currentMode !== data.preferences.themeMode) {
          useThemeStore.getState().toggleMode();
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

  /**
   * Si la biblioteca se inicia vacía (por ejemplo tras reinstalar la app),
   * verifica automáticamente si existe un respaldo en Documents/Gomic y lo recupera.
   */
  public async checkAndRestoreOnFirstLaunch(): Promise<number> {
    try {
      const allComics = await comicRepository.getAllComics();
      if (allComics.length > 0) return 0;

      const backupInfo = await this.checkStorageBackupExists();
      if (!backupInfo.exists || !backupInfo.comicsCount) return 0;

      const result = await this.restoreFromStorageBackup();
      return result.restoredCount + result.updatedCount;
    } catch (err) {
      console.warn('[BackupService] Verificación de primer arranque sin cambios:', err);
      return 0;
    }
  }
}

export const backupService = new BackupService();
