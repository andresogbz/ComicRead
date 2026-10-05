export interface ComicPage {
  index: number;
  filename: string;
  blobUrl?: string;
  isLoading: boolean;
  error?: string;
}

export interface ExtractedPageResult {
  comicId: string;
  pageIndex: number;
  imageBuffer: ArrayBuffer;
  mimeType: string;
}
