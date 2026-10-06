import { archiveWorkerClient } from '../../../infrastructure/workers/archiveWorkerClient';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';
import { pdfService } from './pdfService';

interface CachedPage {
  url: string;
  timestamp: number;
}

export class ReaderCacheService {
  private activeComicId: string | null = null;
  private isPdfSession: boolean = false;
  private initPromise: Promise<void> | null = null;
  private pageCache = new Map<number, CachedPage>();
  private pendingExtractions = new Map<number, Promise<string>>();

  /**
   * Prepara la sesión de caché para un cómic o documento PDF específico.
   * Si la sesión en el worker no está abierta, recupera el archivo de IndexedDB.
   */
  public async initSession(comicId: string, fileName: string): Promise<void> {
    if (this.activeComicId === comicId && this.initPromise) {
      return this.initPromise;
    }

    this.clearAll();
    this.activeComicId = comicId;
    this.isPdfSession = fileName.toLowerCase().endsWith('.pdf');

    this.initPromise = (async () => {
      if (this.isPdfSession) {
        await pdfService.getOrOpenDocument(comicId);
      } else {
        // Verificar si el archivo está en IndexedDB y asegurarse de que el worker lo tenga listo
        const fileBlob = await comicRepository.getComicFile(comicId);
        if (fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          await archiveWorkerClient.openArchive(comicId, fileName, arrayBuffer);
        }
      }
    })();

    return this.initPromise;
  }

  /**
   * Obtiene la URL decodificada de una página específica.
   * Si es un PDF, renderiza la página a alta resolución. Si es un archivo comprimido, lo extrae en segundo plano.
   */
  public async getPageUrl(comicId: string, pageIndex: number): Promise<string> {
    // 1. Devolver desde la caché si ya existe
    const cached = this.pageCache.get(pageIndex);
    if (cached) {
      cached.timestamp = Date.now();
      return cached.url;
    }

    // 2. Si la sesión se está inicializando, esperar a que culmine
    if (this.activeComicId === comicId && this.initPromise) {
      try {
        await this.initPromise;
      } catch (initErr) {
        console.warn('[ReaderCache] Error esperando inicialización:', initErr);
      }
    }

    // 3. Si ya hay una extracción en vuelo para esta página, reusar la misma promesa
    const pending = this.pendingExtractions.get(pageIndex);
    if (pending) {
      return pending;
    }

    // 4. Iniciar renderizado / extracción en segundo plano
    const extractionPromise = (async () => {
      try {
        let blob: Blob;

        if (this.isPdfSession) {
          blob = await pdfService.renderPageToBlob(comicId, pageIndex);
        } else {
          try {
            blob = await archiveWorkerClient.extractPageAsBlob(
              comicId,
              pageIndex
            );
          } catch (firstErr) {
            console.warn(`[ReaderCache] Reintento de extracción página ${pageIndex}:`, firstErr);
            blob = await archiveWorkerClient.extractPageAsBlob(
              comicId,
              pageIndex
            );
          }
        }

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

    // Página previa inmediata
    if (currentIndex > 0 && !this.pageCache.has(currentIndex - 1)) {
      targets.push(currentIndex - 1);
    }

    // Páginas siguientes
    for (let i = 1; i <= aheadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < totalPages && !this.pageCache.has(nextIndex)) {
        targets.push(nextIndex);
      }
    }

    // Cargar en serie no bloqueante
    for (const targetIdx of targets) {
      this.getPageUrl(comicId, targetIdx).catch(() => {});
    }

    // Recolectar páginas distantes para liberar RAM
    this.evictDistantPages(currentIndex);
  }

  /**
   * Libera de memoria páginas fuera de la ventana activa para evitar agotar la RAM.
   */
  private evictDistantPages(currentIndex: number, keepWindow: number = 10): void {
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
    this.initPromise = null;

    if (this.activeComicId) {
      if (this.isPdfSession) {
        pdfService.closeDocument(this.activeComicId);
      } else {
        archiveWorkerClient.closeArchive(this.activeComicId).catch(() => {});
      }
      this.activeComicId = null;
      this.isPdfSession = false;
    }
  }
}

export const readerCache = new ReaderCacheService();
