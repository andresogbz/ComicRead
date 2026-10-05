import Dexie, { type Table } from 'dexie';
import type { ComicFormat } from '../../domain/entities/Comic';

export interface StoredComic {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  format: ComicFormat;
  totalPages: number;
  coverDataUrl?: string;
  lastReadPageIndex: number;
  progressPercentage: number;
  lastReadAt?: number;
  addedAt: number;
  series?: string;
  isFavorite?: boolean;
}

export interface StoredComicFile {
  comicId: string;
  fileBlob: Blob;
  updatedAt: number;
}

export class ComicDatabase extends Dexie {
  comics!: Table<StoredComic, string>;
  comicFiles!: Table<StoredComicFile, string>;

  constructor() {
    super('ComicReadDatabase');

    this.version(1).stores({
      comics: 'id, title, format, progressPercentage, lastReadAt, addedAt, isFavorite, series',
      comicFiles: 'comicId',
    });
  }
}

export const db = new ComicDatabase();
