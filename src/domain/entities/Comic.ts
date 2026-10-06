export type ComicFormat = 'cbz' | 'cbr' | 'pdf' | 'folder' | 'epub' | 'txt';
export type MediaType = 'comic' | 'book';

export interface BookHighlight {
  id: string;
  comicId: string;
  text: string;
  color: string;
  note?: string;
  chapterIndex?: number;
  chapterTitle?: string;
  createdAt: number;
}

export interface ComicMetadata {
  id: string;
  title: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  format: ComicFormat;
  mediaType?: MediaType;
  totalPages: number;
  coverUrl?: string;
  lastReadPageIndex: number;
  progressPercentage: number;
  lastReadAt?: number;
  addedAt: number;
  series?: string;
  collection?: string;
  bookmarks?: number[];
  highlights?: BookHighlight[];
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
