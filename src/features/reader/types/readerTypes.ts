export type ReadingMode = 'ltr' | 'rtl' | 'webtoon';

export type FitMode = 'contain' | 'width' | 'height';

export type PageSpread = 'single' | 'double';

export type ColorFilter = 'none' | 'sepia' | 'warm';

export interface ReaderSettings {
  readingMode: ReadingMode;
  fitMode: FitMode;
  pageSpread: PageSpread;
  brightness: number; // 20 - 100
  colorFilter: ColorFilter;
  autoHideHud: boolean;
}

export interface PageState {
  index: number;
  url?: string;
  isLoading: boolean;
  error?: string;
}
