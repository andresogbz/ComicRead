import type { IArchiveExtractor } from '../../domain/contracts/IArchiveExtractor';
import type { ComicArchiveInfo } from '../../domain/entities/Comic';
import type { ExtractedPageResult } from '../../domain/entities/Page';
import type { WorkerRequest, WorkerResponse } from './workerMessages';

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

const DEFAULT_TIMEOUT_MS = 30000;

export class ArchiveWorkerClient implements IArchiveExtractor {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private messageCounter = 0;

  constructor() {
    this.initWorker();
  }

  /**
   * Inicializa o reinicia el worker en segundo plano.
   */
  private initWorker(): void {
    if (typeof window === 'undefined') return;

    this.worker = new Worker(
      new URL('./archive.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleWorkerResponse(event.data);
    };

    this.worker.onerror = (error) => {
      console.error('[ArchiveWorkerClient] Error en el hilo del worker:', error);
    };
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
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    if (!this.worker) {
      this.initWorker();
    }

    const id = `req_${++this.messageCounter}_${Date.now()}`;

    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(
          new Error(
            `[ArchiveWorkerClient] Tiempo de espera agotado (${timeoutMs}ms) en la solicitud ${id}`
          )
        );
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeoutId });

      const request = buildRequest(id);
      this.worker!.postMessage(request, transferables);
    });
  }

  /**
   * Abre e indexa un archivo .cbz o .cbr en segundo plano sin congelar la UI.
   */
  public async openArchive(
    comicId: string,
    fileName: string,
    fileData: ArrayBuffer
  ): Promise<ComicArchiveInfo> {
    return this.sendRequest<ComicArchiveInfo>(
      (id) => ({
        id,
        type: 'OPEN_ARCHIVE',
        payload: {
          comicId,
          fileName,
          fileData,
        },
      }),
      [fileData] // Transferencia Zero-Copy del buffer completo al worker
    );
  }

  /**
   * Extrae los bytes en crudo de una página en segundo plano.
   */
  public async extractPage(
    comicId: string,
    pageIndex: number
  ): Promise<ExtractedPageResult> {
    return this.sendRequest<ExtractedPageResult>((id) => ({
      id,
      type: 'EXTRACT_PAGE',
      payload: {
        comicId,
        pageIndex,
      },
    }));
  }

  /**
   * Método de alto nivel que extrae la página y la convierte en un Blob listo para URL.createObjectURL.
   */
  public async extractPageAsBlob(
    comicId: string,
    pageIndex: number
  ): Promise<Blob> {
    const result = await this.extractPage(comicId, pageIndex);
    return new Blob([result.imageBuffer], { type: result.mimeType });
  }

  /**
   * Libera de la memoria del Worker la sesión del cómic.
   */
  public async closeArchive(comicId: string): Promise<void> {
    return this.sendRequest<void>((id) => ({
      id,
      type: 'CLOSE_ARCHIVE',
      payload: { comicId },
    }));
  }

  /**
   * Destruye el worker completamente si es necesario.
   */
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

// Instancia singleton para uso en toda la aplicación
export const archiveWorkerClient = new ArchiveWorkerClient();
