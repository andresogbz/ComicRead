import JSZip from 'jszip';
import { createExtractorFromData, type Extractor } from 'node-unrar-js';
import { isSupportedImageFile, getMimeTypeFromFilename } from '../../core/utils/mimeHelper';
import { naturalSortFilePaths } from '../../core/utils/naturalSort';
import type { ComicArchiveInfo, ComicFormat } from '../../domain/entities/Comic';

interface CbzSession {
  format: 'cbz';
  zip: JSZip;
  pages: string[];
}

interface CbrSession {
  format: 'cbr';
  extractor: Extractor<Uint8Array>;
  pages: string[];
}

type ArchiveSession = CbzSession | CbrSession;

class ArchiveCore {
  private activeSessions = new Map<string, ArchiveSession>();
  private wasmBinaryCache: ArrayBuffer | null = null;

  /**
   * Intenta precargar el binario WASM de unrar si está en entorno de navegador.
   */
  private async getWasmBinary(): Promise<ArrayBuffer | undefined> {
    if (this.wasmBinaryCache) return this.wasmBinaryCache;

    if (typeof fetch === 'function') {
      const candidates = ['/unrar.wasm', './unrar.wasm', 'unrar.wasm', '/js/unrar.wasm'];
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            this.wasmBinaryCache = await res.arrayBuffer();
            return this.wasmBinaryCache;
          }
        } catch {
          // Continuar al siguiente candidato
        }
      }
    }
    return undefined;
  }

  /**
   * Detecta si el archivo es ZIP/CBZ o RAR/CBR.
   */
  public detectFormat(fileName: string, buffer: ArrayBuffer): ComicFormat {
    const bytes = new Uint8Array(buffer, 0, Math.min(8, buffer.byteLength));

    // Magic bytes para ZIP / CBZ: 'PK\x03\x04' o 'PK\x05\x06'
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
      return 'cbz';
    }

    // Magic bytes para RAR / CBR: 'Rar!\x1a\x07'
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x61 &&
      bytes[2] === 0x72 &&
      bytes[3] === 0x21
    ) {
      return 'cbr';
    }

    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.cbr') || lowerName.endsWith('.rar')) {
      return 'cbr';
    }

    return 'cbz';
  }

  /**
   * Abre e indexa un archivo CBZ (ZIP) y extrae su portada.
   */
  public async openCbz(comicId: string, buffer: ArrayBuffer): Promise<ComicArchiveInfo> {
    const zip = await JSZip.loadAsync(buffer);
    const imageFiles: string[] = [];

    zip.forEach((relativePath, file) => {
      if (!file.dir && isSupportedImageFile(relativePath)) {
        imageFiles.push(relativePath);
      }
    });

    if (imageFiles.length === 0) {
      throw new Error('El archivo CBZ no contiene imágenes compatibles (JPG, PNG, WEBP, AVIF).');
    }

    const sortedPages = naturalSortFilePaths(imageFiles);

    this.activeSessions.set(comicId, {
      format: 'cbz',
      zip,
      pages: sortedPages,
    });

    // Extraer portada (buscar primero archivo explícito tipo 'cover', 'portada', 'front', o primera página)
    let coverBuffer: ArrayBuffer | undefined;
    let coverMimeType: string | undefined;

    const explicitCoverCbz = sortedPages.find((p) => /(?:^|[\\/_-])(?:cover|portada|front)\b/i.test(p));
    const coverPageCbz = explicitCoverCbz || sortedPages[0];
    const zipEntry = zip.file(coverPageCbz);
    if (zipEntry) {
      const rawData = await zipEntry.async('uint8array');
      coverBuffer = rawData.buffer.slice(
        rawData.byteOffset,
        rawData.byteOffset + rawData.byteLength
      ) as ArrayBuffer;
      coverMimeType = getMimeTypeFromFilename(coverPageCbz);
    }

    return {
      comicId,
      format: 'cbz',
      totalPages: sortedPages.length,
      pageNames: sortedPages,
      coverBuffer,
      coverMimeType,
    };
  }

  /**
   * Abre e indexa un archivo CBR (RAR) y extrae su portada.
   */
  public async openCbr(comicId: string, buffer: ArrayBuffer): Promise<ComicArchiveInfo> {
    const wasmBinary = await this.getWasmBinary();
    const extractor = await createExtractorFromData({
      data: buffer,
      wasmBinary,
    });

    const fileList = extractor.getFileList();
    const imageFiles: string[] = [];

    for (const header of fileList.fileHeaders) {
      if (!header.flags.directory && isSupportedImageFile(header.name)) {
        imageFiles.push(header.name);
      }
    }

    if (imageFiles.length === 0) {
      throw new Error('El archivo CBR no contiene imágenes válidas soportadas.');
    }

    const sortedPages = naturalSortFilePaths(imageFiles);

    this.activeSessions.set(comicId, {
      format: 'cbr',
      extractor,
      pages: sortedPages,
    });

    // Extraer portada (priorizar 'cover' o primera página)
    let coverBuffer: ArrayBuffer | undefined;
    let coverMimeType: string | undefined;

    const explicitCoverCbr = sortedPages.find((p) => /(?:^|[\\/_-])(?:cover|portada|front)\b/i.test(p));
    const coverPageCbr = explicitCoverCbr || sortedPages[0];
    const extracted = extractor.extract({ files: [coverPageCbr] });
    for (const arcFile of extracted.files) {
      if (arcFile.extraction) {
        const raw = arcFile.extraction;
        coverBuffer = raw.buffer.slice(
          raw.byteOffset,
          raw.byteOffset + raw.byteLength
        ) as ArrayBuffer;
        coverMimeType = getMimeTypeFromFilename(coverPageCbr);
        break;
      }
    }

    return {
      comicId,
      format: 'cbr',
      totalPages: sortedPages.length,
      pageNames: sortedPages,
      coverBuffer,
      coverMimeType,
    };
  }

  /**
   * Abre cualquier archivo (detectando si es CBZ o CBR).
   */
  public async openArchive(
    comicId: string,
    fileName: string,
    buffer: ArrayBuffer
  ): Promise<ComicArchiveInfo> {
    const format = this.detectFormat(fileName, buffer);
    if (format === 'cbr') {
      return this.openCbr(comicId, buffer);
    } else {
      return this.openCbz(comicId, buffer);
    }
  }

  /**
   * Extrae una página específica de la sesión activa.
   */
  public async extractPage(
    comicId: string,
    pageIndex: number
  ): Promise<{
    comicId: string;
    pageIndex: number;
    imageBuffer: ArrayBuffer;
    mimeType: string;
  }> {
    const session = this.activeSessions.get(comicId);
    if (!session) {
      throw new Error(`Sesión de cómic no encontrada: ${comicId}`);
    }

    if (pageIndex < 0 || pageIndex >= session.pages.length) {
      throw new Error(`Índice de página fuera de rango (${pageIndex} de ${session.pages.length})`);
    }

    const pagePath = session.pages[pageIndex];
    const mimeType = getMimeTypeFromFilename(pagePath);

    if (session.format === 'cbz') {
      const zipEntry = session.zip.file(pagePath);
      if (!zipEntry) {
        throw new Error(`Página no encontrada en CBZ: ${pagePath}`);
      }
      const rawData = await zipEntry.async('uint8array');
      const imageBuffer = rawData.buffer.slice(
        rawData.byteOffset,
        rawData.byteOffset + rawData.byteLength
      ) as ArrayBuffer;
      return { comicId, pageIndex, imageBuffer, mimeType };
    } else {
      const extracted = session.extractor.extract({ files: [pagePath] });
      for (const arcFile of extracted.files) {
        if (arcFile.extraction) {
          const raw = arcFile.extraction;
          const imageBuffer = raw.buffer.slice(
            raw.byteOffset,
            raw.byteOffset + raw.byteLength
          ) as ArrayBuffer;
          return { comicId, pageIndex, imageBuffer, mimeType };
        }
      }
      throw new Error(`Fallo al descomprimir página CBR: ${pagePath}`);
    }
  }

  /**
   * Cierra y libera la sesión del cómic.
   */
  public closeArchive(comicId: string): void {
    this.activeSessions.delete(comicId);
  }
}

export const archiveCore = new ArchiveCore();
