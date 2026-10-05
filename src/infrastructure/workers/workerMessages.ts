import type { ComicFormat } from '../../domain/entities/Comic';

export type WorkerRequest =
  | {
      id: string;
      type: 'OPEN_ARCHIVE';
      payload: {
        comicId: string;
        fileName: string;
        fileData: ArrayBuffer;
      };
    }
  | {
      id: string;
      type: 'EXTRACT_PAGE';
      payload: {
        comicId: string;
        pageIndex: number;
      };
    }
  | {
      id: string;
      type: 'CLOSE_ARCHIVE';
      payload: {
        comicId: string;
      };
    };

export type WorkerResponse =
  | {
      id: string;
      type: 'OPEN_ARCHIVE_SUCCESS';
      payload: {
        comicId: string;
        format: ComicFormat;
        totalPages: number;
        pageNames: string[];
        coverBuffer?: ArrayBuffer;
        coverMimeType?: string;
      };
    }
  | {
      id: string;
      type: 'EXTRACT_PAGE_SUCCESS';
      payload: {
        comicId: string;
        pageIndex: number;
        imageBuffer: ArrayBuffer;
        mimeType: string;
      };
    }
  | {
      id: string;
      type: 'CLOSE_ARCHIVE_SUCCESS';
      payload: {
        comicId: string;
      };
    }
  | {
      id: string;
      type: 'ERROR';
      error: string;
    };
