import type { ComicArchiveInfo } from '../entities/Comic';
import type { ExtractedPageResult } from '../entities/Page';

export interface IArchiveExtractor {
  /**
   * Abre e indexa un archivo de cómic (.cbz o .cbr) en un hilo en segundo plano.
   * Retorna la información del archivo, nombres de páginas ordenados y la portada.
   */
  openArchive(comicId: string, fileName: string, fileData: ArrayBuffer): Promise<ComicArchiveInfo>;

  /**
   * Extrae los bytes de una página específica por índice.
   * Transfiere el buffer de memoria sin copia.
   */
  extractPage(comicId: string, pageIndex: number): Promise<ExtractedPageResult>;

  /**
   * Libera de memoria los recursos del archivo en el worker.
   */
  closeArchive(comicId: string): Promise<void>;
}
