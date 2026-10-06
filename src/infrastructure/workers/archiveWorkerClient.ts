import type { IArchiveExtractor } from '../../domain/contracts/IArchiveExtractor';
import type { ComicArchiveInfo } from '../../domain/entities/Comic';
import type { ExtractedPageResult } from '../../domain/entities/Page';
import { archiveCore } from '../extractors/archiveCore';
import type { WorkerRequest, WorkerResponse } from './workerMessages';

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

// Timeout saludable (25s) para permitir descompresión secuencial pesada en móviles sin cortes falsos
const WORKER_TIMEOUT_MS = 25000;

interface StoredArchive {
  fileName: string;
  buffer: ArrayBuffer;
  openedInDirectCore: boolean;
}

export class ArchiveWorkerClient implements IArchiveExtractor {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private activeArchives = new Map<string, StoredArchive>();
  private messageCounter = 0;
  private useFallback = false;

  constructor() {
    this.initWorker();
  }

  /**
   * Inicializa el Web Worker con control de errores para fallback directo.
   */
  private initWorker(): void {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      this.useFallback = true;
      return;
    }

    try {
      this.worker = new Worker(
        new URL('./archive.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerResponse(event.data);
      };

      this.worker.onerror = (error) => {
        console.warn('[ArchiveWorkerClient] El Web Worker no pudo ejecutarse o falló. Conmutando a modo directo:', error);
        this.useFallback = true;

        // Rechazar solicitudes pendientes para que conmuten a archiveCore inmediatamente
        for (const [id, pending] of this.pendingRequests.entries()) {
          clearTimeout(pending.timeoutId);
          pending.reject(new Error('Web Worker unavailable'));
          this.pendingRequests.delete(id);
        }
      };
    } catch (err) {
      console.warn('[ArchiveWorkerClient] Error al instanciar Worker. Usando motor directo:', err);
      this.useFallback = true;
    }
  }

  private handleWorkerResponse(response: WorkerResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    this.pendingRequests.delete(response.id);

    if (response.type === 'ERROR') {
      pending.reject(new Error(response.error));
      return;
    }

    switch (response.type) {
      case 'OPEN_ARCHIVE_SUCCESS':
        pending.resolve(response.payload);
        break;
      case 'EXTRACT_PAGE_SUCCESS':
        pending.resolve(response.payload);
        break;
      case 'CLOSE_ARCHIVE_SUCCESS':
        pending.resolve(undefined);
        break;
    }
  }

  private sendRequest<T>(
    buildRequest: (id: string) => WorkerRequest,
    transferables: Transferable[] = [],
    timeoutMs: number = WORKER_TIMEOUT_MS
  ): Promise<T> {
    if (this.useFallback || !this.worker) {
      return Promise.reject(new Error('Worker in fallback mode'));
    }

    const id = `req_${++this.messageCounter}_${Date.now()}`;

    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        this.useFallback = true; // Si el worker no responde a tiempo, conmutar a motor directo
        reject(new Error(`Timeout en el worker (${timeoutMs}ms)`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeoutId });

      try {
        const request = buildRequest(id);
        this.worker!.postMessage(request, transferables);
      } catch (err) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(id);
        this.useFallback = true;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  /**
   * Asegura que archiveCore tenga abierta la sesión si el worker falla o conmuta a fallback.
   */
  private async ensureCoreSession(comicId: string): Promise<void> {
    const archive = this.activeArchives.get(comicId);
    if (archive && !archive.openedInDirectCore) {
      await archiveCore.openArchive(comicId, archive.fileName, archive.buffer);
      archive.openedInDirectCore = true;
    }
  }

  /**
   * Abre e indexa un archivo .cbz o .cbr con fallback automático garantizado.
   */
  public async openArchive(
    comicId: string,
    fileName: string,
    fileData: ArrayBuffer
  ): Promise<ComicArchiveInfo> {
    // Guardar copia para respaldo de fallback si el worker experimenta problemas
    const backupBuffer = fileData.slice(0);
    this.activeArchives.set(comicId, {
      fileName,
      buffer: backupBuffer,
      openedInDirectCore: false,
    });

    // Si ya sabemos que el worker no está disponible, ir directo a archiveCore
    if (this.useFallback) {
      const info = await archiveCore.openArchive(comicId, fileName, fileData);
      const entry = this.activeArchives.get(comicId);
      if (entry) entry.openedInDirectCore = true;
      return info;
    }

    try {
      return await this.sendRequest<ComicArchiveInfo>(
        (id) => ({
          id,
          type: 'OPEN_ARCHIVE',
          payload: {
            comicId,
            fileName,
            fileData,
          },
        }),
        [fileData]
      );
    } catch {
      // Fallback transparente al motor directo con la copia de respaldo
      const info = await archiveCore.openArchive(comicId, fileName, backupBuffer);
      const entry = this.activeArchives.get(comicId);
      if (entry) entry.openedInDirectCore = true;
      return info;
    }
  }

  /**
   * Extrae los bytes de una página con fallback garantizado.
   */
  public async extractPage(
    comicId: string,
    pageIndex: number
  ): Promise<ExtractedPageResult> {
    if (this.useFallback) {
      await this.ensureCoreSession(comicId);
      return archiveCore.extractPage(comicId, pageIndex);
    }

    try {
      return await this.sendRequest<ExtractedPageResult>((id) => ({
        id,
        type: 'EXTRACT_PAGE',
        payload: {
          comicId,
          pageIndex,
        },
      }));
    } catch {
      await this.ensureCoreSession(comicId);
      return archiveCore.extractPage(comicId, pageIndex);
    }
  }

  /**
   * Extrae la página directamente como Blob.
   */
  public async extractPageAsBlob(
    comicId: string,
    pageIndex: number
  ): Promise<Blob> {
    const result = await this.extractPage(comicId, pageIndex);
    return new Blob([result.imageBuffer], { type: result.mimeType });
  }

  /**
   * Libera la sesión de cómic activa.
   */
  public async closeArchive(comicId: string): Promise<void> {
    this.activeArchives.delete(comicId);
    archiveCore.closeArchive(comicId);
    if (!this.useFallback && this.worker) {
      this.sendRequest<void>((id) => ({
        id,
        type: 'CLOSE_ARCHIVE',
        payload: { comicId },
      })).catch(() => {});
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const [id, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Worker terminado manualmente'));
      this.pendingRequests.delete(id);
    }
  }
}

export const archiveWorkerClient = new ArchiveWorkerClient();
