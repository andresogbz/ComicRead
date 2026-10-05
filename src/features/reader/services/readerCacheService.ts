import { archiveWorkerClient } from '../../../infrastructure/workers/archiveWorkerClient';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';

interface CachedPage {
  url: string;
  timestamp: number;
}

export class ReaderCacheService {
  private activeComicId: string | null = null;
  private pageCache = new Map<number, CachedPage>();
  private pendingExtractions = new Map<number, Promise<string>>();

  /**
   * Prepara la sesión de caché para un cómic específico.
   * Si la sesión en el worker no está abierta, recupera el archivo de IndexedDB.
   */
  public async initSession(comicId: string, fileName: string): Promise<void> {
    if (this.activeComicId === comicId) return;

    this.clearAll();
    this.activeComicId = comicId;

    // Verificar si el archivo está en IndexedDB y asegurarse de que el worker lo tenga listo
    const fileBlob = await comicRepository.getComicFile(comicId);
    if (fileBlob) {
      const arrayBuffer = await fileBlob.arrayBuffer();
      await archiveWorkerClient.openArchive(comicId, fileName, arrayBuffer);
    }
  }

  /**
   * Obtiene la URL decodificada de una página específica.
   * Si no está en caché, la extrae en segundo plano desde el Web Worker.
   */
  public async getPageUrl(comicId: string, pageIndex: number): Promise<string> {
    // 1. Devolver desde la caché si ya existe
    const cached = this.pageCache.get(pageIndex);
    if (cached) {
      cached.timestamp = Date.now();
      return cached.url;
    }

    // 2. Si ya hay una extracción en vuelo para esta página, reusar la misma promesa
    const pending = this.pendingExtractions.get(pageIndex);
    if (pending) {
      return pending;
    }

    // 3. Iniciar extracción en segundo plano
    const extractionPromise = (async () => {
      try {
        const blob = await archiveWorkerClient.extractPageAsBlob(
          comicId,
          pageIndex
        );
        const url = URL.createObjectURL(blob);

        this.pageCache.set(pageIndex, {
          url,
          timestamp: Date.now(),
        });

        return url;
      } finally {
        this.pendingExtractions.delete(pageIndex);
      }
    })();

    this.pendingExtractions.set(pageIndex, extractionPromise);
    return extractionPromise;
  }

  /**
   * Pre-carga predictiva de páginas contiguas (la anterior y las siguientes N páginas).
   * Evita cualquier retraso perceptible al cambiar de página.
   */
  public async prefetchRange(
    comicId: string,
    currentIndex: number,
    totalPages: number,
    aheadCount: number = 3
  ): Promise<void> {
    const targets: number[] = [];

    // Pre-cargar la página anterior para retrocesos inmediatos
    if (currentIndex > 0) {
      targets.push(currentIndex - 1);
    }

    // Pre-cargar las siguientes 'aheadCount' páginas
    for (
      let i = currentIndex + 1;
      i <= Math.min(currentIndex + aheadCount, totalPages - 1);
      i++
    ) {
      targets.push(i);
    }

    // Disparar pre-cargas en segundo plano de manera no bloqueante
    for (const pageIndex of targets) {
      if (!this.pageCache.has(pageIndex) && !this.pendingExtractions.has(pageIndex)) {
        this.getPageUrl(comicId, pageIndex).catch((err) => {
          console.warn(`[ReaderCache] Fallo de precarga en página ${pageIndex}:`, err);
        });
      }
    }

    // Recolectar páginas distantes para liberar RAM
    this.evictDistantPages(currentIndex);
  }

  /**
   * Libera de memoria páginas fuera de la ventana activa para evitar agotar la RAM.
   */
  private evictDistantPages(currentIndex: number, keepWindow: number = 6): void {
    for (const [pageIndex, cached] of this.pageCache.entries()) {
      if (Math.abs(pageIndex - currentIndex) > keepWindow) {
        URL.revokeObjectURL(cached.url);
        this.pageCache.delete(pageIndex);
      }
    }
  }

  /**
   * Libera toda la memoria y URLs creadas al cerrar el lector.
   */
  public clearAll(): void {
    for (const cached of this.pageCache.values()) {
      URL.revokeObjectURL(cached.url);
    }
    this.pageCache.clear();
    this.pendingExtractions.clear();

    if (this.activeComicId) {
      archiveWorkerClient.closeArchive(this.activeComicId).catch(() => {});
      this.activeComicId = null;
    }
  }
}

export const readerCache = new ReaderCacheService();
