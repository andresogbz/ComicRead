export type ComicFormat = 'cbz' | 'cbr' | 'pdf' | 'folder';

export interface ComicMetadata {
  id: string;
  title: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  format: ComicFormat;
  totalPages: number;
  coverUrl?: string;
  lastReadPageIndex: number;
  progressPercentage: number;
  lastReadAt?: number;
  addedAt: number;
  series?: string;
  isFavorite?: boolean;
}

export interface ComicArchiveInfo {
  comicId: string;
  format: ComicFormat;
  totalPages: number;
  pageNames: string[];
  coverBuffer?: ArrayBuffer;
  coverMimeType?: string;
}
