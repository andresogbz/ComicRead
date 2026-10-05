import JSZip from 'jszip';
import { createExtractorFromData, type Extractor } from 'node-unrar-js';
import { isSupportedImageFile, getMimeTypeFromFilename } from '../../core/utils/mimeHelper';
import { naturalSortFilePaths } from '../../core/utils/naturalSort';
import type { ComicFormat } from '../../domain/entities/Comic';
import type { WorkerRequest, WorkerResponse } from './workerMessages';

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

// Helper para convertir slice de Uint8Array a ArrayBuffer puro transferible
function toArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  return uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength
  ) as ArrayBuffer;
}

// Registro en memoria de sesiones de cómics abiertas en este Worker
const activeSessions = new Map<string, ArchiveSession>();

/**
 * Detecta el formato del archivo por magic bytes y extensión.
 */
function detectArchiveFormat(fileName: string, buffer: ArrayBuffer): ComicFormat {
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

  // Detección secundaria por extensión
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.cbr') || lowerName.endsWith('.rar')) {
    return 'cbr';
  }

  return 'cbz';
}

/**
 * Procesa la apertura y escaneo de un archivo CBZ (ZIP) en el worker.
 */
async function handleOpenCbz(
  comicId: string,
  buffer: ArrayBuffer
): Promise<{
  format: ComicFormat;
  totalPages: number;
  pageNames: string[];
  coverBuffer?: ArrayBuffer;
  coverMimeType?: string;
}> {
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

  activeSessions.set(comicId, {
    format: 'cbz',
    zip,
    pages: sortedPages,
  });

  // Extraer portada (página 0) inmediatamente
  let coverBuffer: ArrayBuffer | undefined;
  let coverMimeType: string | undefined;

  const firstPage = sortedPages[0];
  const zipEntry = zip.file(firstPage);
  if (zipEntry) {
    const rawData = await zipEntry.async('uint8array');
    coverBuffer = toArrayBuffer(rawData);
    coverMimeType = getMimeTypeFromFilename(firstPage);
  }

  return {
    format: 'cbz',
    totalPages: sortedPages.length,
    pageNames: sortedPages,
    coverBuffer,
    coverMimeType,
  };
}

/**
 * Procesa la apertura y escaneo de un archivo CBR (RAR) mediante WASM en el worker.
 */
async function handleOpenCbr(
  comicId: string,
  buffer: ArrayBuffer
): Promise<{
  format: ComicFormat;
  totalPages: number;
  pageNames: string[];
  coverBuffer?: ArrayBuffer;
  coverMimeType?: string;
}> {
  const extractor = await createExtractorFromData({ data: buffer });
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

  activeSessions.set(comicId, {
    format: 'cbr',
    extractor,
    pages: sortedPages,
  });

  // Extraer portada (página 0)
  let coverBuffer: ArrayBuffer | undefined;
  let coverMimeType: string | undefined;

  const firstPage = sortedPages[0];
  const extracted = extractor.extract({ files: [firstPage] });
  for (const arcFile of extracted.files) {
    if (arcFile.extraction) {
      const raw = arcFile.extraction;
      coverBuffer = toArrayBuffer(raw);
      coverMimeType = getMimeTypeFromFilename(firstPage);
      break;
    }
  }

  return {
    format: 'cbr',
    totalPages: sortedPages.length,
    pageNames: sortedPages,
    coverBuffer,
    coverMimeType,
  };
}

/**
 * Extrae una página específica de la sesión activa en el worker.
 */
async function handleExtractPage(
  comicId: string,
  pageIndex: number
): Promise<{
  pageIndex: number;
  imageBuffer: ArrayBuffer;
  mimeType: string;
}> {
  const session = activeSessions.get(comicId);
  if (!session) {
    throw new Error(`No existe sesión de cómic activa para el ID: ${comicId}`);
  }

  if (pageIndex < 0 || pageIndex >= session.pages.length) {
    throw new Error(
      `Índice de página fuera de rango (${pageIndex} de ${session.pages.length})`
    );
  }

  const pagePath = session.pages[pageIndex];
  const mimeType = getMimeTypeFromFilename(pagePath);

  if (session.format === 'cbz') {
    const zipEntry = session.zip.file(pagePath);
    if (!zipEntry) {
      throw new Error(`No se encontró la página '${pagePath}' en el archivo CBZ.`);
    }
    const rawData = await zipEntry.async('uint8array');
    const imageBuffer = toArrayBuffer(rawData);
    return { pageIndex, imageBuffer, mimeType };
  } else {
    // Formato CBR
    const extracted = session.extractor.extract({ files: [pagePath] });
    for (const arcFile of extracted.files) {
      if (arcFile.extraction) {
        const raw = arcFile.extraction;
        const imageBuffer = toArrayBuffer(raw);
        return { pageIndex, imageBuffer, mimeType };
      }
    }
    throw new Error(`Fallo al descomprimir la página CBR '${pagePath}'.`);
  }
}

/**
 * Listener global del Worker para recibir mensajes del hilo principal.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  const { id, type } = message;

  try {
    switch (type) {
      case 'OPEN_ARCHIVE': {
        const { comicId, fileName, fileData } = message.payload;
        const format = detectArchiveFormat(fileName, fileData);

        const result =
          format === 'cbr'
            ? await handleOpenCbr(comicId, fileData)
            : await handleOpenCbz(comicId, fileData);

        const response: WorkerResponse = {
          id,
          type: 'OPEN_ARCHIVE_SUCCESS',
          payload: {
            comicId,
            format: result.format,
            totalPages: result.totalPages,
            pageNames: result.pageNames,
            coverBuffer: result.coverBuffer,
            coverMimeType: result.coverMimeType,
          },
        };

        // Si se extrajo portada, transferir el buffer sin costo de copia
        if (result.coverBuffer) {
          self.postMessage(response, [result.coverBuffer]);
        } else {
          self.postMessage(response);
        }
        break;
      }

      case 'EXTRACT_PAGE': {
        const { comicId, pageIndex } = message.payload;
        const result = await handleExtractPage(comicId, pageIndex);

        const response: WorkerResponse = {
          id,
          type: 'EXTRACT_PAGE_SUCCESS',
          payload: {
            comicId,
            pageIndex: result.pageIndex,
            imageBuffer: result.imageBuffer,
            mimeType: result.mimeType,
          },
        };

        // Transferencia Zero-Copy del ArrayBuffer de la imagen extraída
        self.postMessage(response, [result.imageBuffer]);
        break;
      }

      case 'CLOSE_ARCHIVE': {
        const { comicId } = message.payload;
        activeSessions.delete(comicId);

        const response: WorkerResponse = {
          id,
          type: 'CLOSE_ARCHIVE_SUCCESS',
          payload: { comicId },
        };
        self.postMessage(response);
        break;
      }

      default: {
        const response: WorkerResponse = {
          id,
          type: 'ERROR',
          error: `Operación de worker desconocida: ${(message as any).type}`,
        };
        self.postMessage(response);
      }
    }
  } catch (error: any) {
    const response: WorkerResponse = {
      id,
      type: 'ERROR',
      error: error?.message || 'Error desconocido en el worker de descompresión.',
    };
    self.postMessage(response);
  }
};
