export type ReadingMode = 'ltr' | 'rtl' | 'webtoon';

export type FitMode = 'contain' | 'width' | 'height';

export interface ReaderSettings {
  readingMode: ReadingMode;
  fitMode: FitMode;
  autoHideHud: boolean;
}

export interface PageState {
  index: number;
  url?: string;
  isLoading: boolean;
  error?: string;
}
