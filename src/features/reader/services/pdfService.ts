import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ComicMetadata } from '../../../domain/entities/Comic';
import { comicRepository } from '../../../infrastructure/database/repositories/DexieComicRepository';

// Configurar el worker de PDF.js de forma estática y offline para Vite y Capacitor
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export class PdfService {
  private openDocs = new Map<string, pdfjsLib.PDFDocumentProxy>();
  private openPromises = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();

  /**
   * Abre o reutiliza una instancia de PDFDocumentProxy para un cómic o libro específico.
   */
  public async getOrOpenDocument(
    comicId: string,
    providedBuffer?: ArrayBuffer
  ): Promise<pdfjsLib.PDFDocumentProxy> {
    const existing = this.openDocs.get(comicId);
    if (existing) {
      return existing;
    }

    const inFlight = this.openPromises.get(comicId);
    if (inFlight) {
      return inFlight;
    }

    const openPromise = (async () => {
      try {
        let buffer = providedBuffer;
        if (!buffer) {
          const fileBlob = await comicRepository.getComicFile(comicId);
          if (!fileBlob) {
            throw new Error('No se encontró el archivo PDF en el almacenamiento local.');
          }
          buffer = await fileBlob.arrayBuffer();
        }

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        this.openDocs.set(comicId, doc);
        return doc;
      } finally {
        this.openPromises.delete(comicId);
      }
    })();

    this.openPromises.set(comicId, openPromise);
    return openPromise;
  }

  /**
   * Procesa un archivo PDF durante la importación: extrae número de páginas,
   * renderiza la portada de la primera página y genera los metadatos iniciales.
   */
  public async processPdfFile(file: File): Promise<{
    metadata: ComicMetadata;
    coverUrl?: string;
  }> {
    const comicId = this.generateFileId(file);
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await this.getOrOpenDocument(comicId, arrayBuffer);

    const totalPages = pdfDoc.numPages;
    let coverUrl: string | undefined;

    // Renderizar la página 1 como portada nítida
    try {
      const page1 = await pdfDoc.getPage(1);
      const viewport = page1.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page1.render({
          canvas,
          canvasContext: ctx,
          viewport,
        }).promise;

        coverUrl = canvas.toDataURL('image/jpeg', 0.88);
      }
    } catch (coverErr) {
      console.warn('[PdfService] No se pudo renderizar la portada del PDF:', coverErr);
    }

    const title = this.formatPdfTitle(file.name);

    const metadata: ComicMetadata = {
      id: comicId,
      title,
      fileName: file.name,
      fileSize: file.size,
      format: 'pdf',
      mediaType: 'comic',
      totalPages,
      coverUrl,
      lastReadPageIndex: 0,
      progressPercentage: 0,
      addedAt: Date.now(),
    };

    return { metadata, coverUrl };
  }

  /**
   * Renderiza una página específica del documento PDF a un Blob de imagen de alta resolución
   * para consumirlo fluidamente en el lector PagedView o WebtoonView.
   */
  public async renderPageToBlob(
    comicId: string,
    pageIndex: number,
    scale = 2.0
  ): Promise<Blob> {
    const pdfDoc = await this.getOrOpenDocument(comicId);
    const pageNumber = Math.min(Math.max(1, pageIndex + 1), pdfDoc.numPages);

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo inicializar el contexto 2D para renderizar la página PDF.');
    }

    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
    }).promise;

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Fallo al convertir canvas de la página ${pageNumber} a imagen.`));
          }
        },
        'image/webp',
        0.92
      );
    });
  }

  /**
   * Cierra y libera memoria del documento PDF cuando el usuario sale del lector.
   */
  public closeDocument(comicId: string): void {
    const doc = this.openDocs.get(comicId);
    if (doc) {
      doc.cleanup().catch(() => {});
      doc.loadingTask.destroy().catch(() => {});
      this.openDocs.delete(comicId);
    }
  }

  private generateFileId(file: File): string {
    const raw = `${file.name}_${file.size}_${file.lastModified}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `pdf_${Math.abs(hash).toString(36)}`;
  }

  private formatPdfTitle(fileName: string): string {
    return fileName
      .replace(/\.pdf$/i, '')
      .replace(/[_]+/g, ' ')
      .trim();
  }
}

export const pdfService = new PdfService();
