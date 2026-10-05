import type { ComicArchiveInfo, ComicMetadata } from '../../../domain/entities/Comic';
import { archiveWorkerClient } from '../../../infrastructure/workers/archiveWorkerClient';

export class ComicFileService {
  /**
   * Abre un archivo local (.cbz o .cbr), lo procesa en el Web Worker
   * y devuelve los metadatos completos junto con la URL de la portada.
   */
  public async processComicFile(file: File): Promise<{
    metadata: ComicMetadata;
    archiveInfo: ComicArchiveInfo;
    coverUrl?: string;
  }> {
    const comicId = this.generateFileId(file);
    const arrayBuffer = await file.arrayBuffer();

    // La descompresión e inspección ocurre 100% en el background worker
    const archiveInfo = await archiveWorkerClient.openArchive(
      comicId,
      file.name,
      arrayBuffer
    );

    let coverUrl: string | undefined;
    if (archiveInfo.coverBuffer && archiveInfo.coverMimeType) {
      const coverBlob = new Blob([archiveInfo.coverBuffer], {
        type: archiveInfo.coverMimeType,
      });
      coverUrl = URL.createObjectURL(coverBlob);
    }

    const title = this.formatComicTitle(file.name);

    const metadata: ComicMetadata = {
      id: comicId,
      title,
      fileName: file.name,
      fileSize: file.size,
      format: archiveInfo.format,
      totalPages: archiveInfo.totalPages,
      coverUrl,
      lastReadPageIndex: 0,
      progressPercentage: 0,
      addedAt: Date.now(),
    };

    return { metadata, archiveInfo, coverUrl };
  }

  /**
   * Genera un identificador único y consistente para un archivo basado en nombre, tamaño y fecha.
   */
  private generateFileId(file: File): string {
    const raw = `${file.name}_${file.size}_${file.lastModified}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `comic_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Limpia el nombre del archivo para generar un título legible.
   * Remueve extensiones (.cbz, .cbr) y reemplaza guiones bajos.
   */
  private formatComicTitle(fileName: string): string {
    return fileName
      .replace(/\.(cbz|cbr|zip|rar)$/i, '')
      .replace(/[_]+/g, ' ')
      .trim();
  }
}

export const comicFileService = new ComicFileService();
