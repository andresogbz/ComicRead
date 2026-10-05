import { archiveCore } from '../extractors/archiveCore';
import type { WorkerRequest, WorkerResponse } from './workerMessages';

/**
 * Worker dedicado a la descompresión en segundo plano.
 * Utiliza archiveCore y devuelve buffers transferibles.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  const { id, type } = message;

  try {
    switch (type) {
      case 'OPEN_ARCHIVE': {
        const { comicId, fileName, fileData } = message.payload;
        const result = await archiveCore.openArchive(comicId, fileName, fileData);

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

        if (result.coverBuffer) {
          self.postMessage(response, [result.coverBuffer]);
        } else {
          self.postMessage(response);
        }
        break;
      }

      case 'EXTRACT_PAGE': {
        const { comicId, pageIndex } = message.payload;
        const result = await archiveCore.extractPage(comicId, pageIndex);

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

        self.postMessage(response, [result.imageBuffer]);
        break;
      }

      case 'CLOSE_ARCHIVE': {
        const { comicId } = message.payload;
        archiveCore.closeArchive(comicId);

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
          error: `Operación desconocida: ${(message as any).type}`,
        };
        self.postMessage(response);
      }
    }
  } catch (error: any) {
    const response: WorkerResponse = {
      id,
      type: 'ERROR',
      error: error?.message || 'Error en el worker de descompresión.',
    };
    self.postMessage(response);
  }
};
