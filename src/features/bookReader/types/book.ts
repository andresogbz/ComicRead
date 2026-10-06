export interface BookChapter {
  id: string;
  index: number;
  title: string;
  content: string; // HTML limpio o párrafos para renderizar
  wordCount: number;
}

export interface BookData {
  bookId: string;
  title: string;
  author?: string;
  format: 'epub' | 'txt' | 'pdf';
  chapters: BookChapter[];
  totalChapters: number;
  totalWords: number;
  coverUrl?: string;
}

export type BookTheme = 'sepia' | 'crema' | 'white' | 'slate' | 'oled';

export interface BookThemeConfig {
  id: BookTheme;
  name: string;
  bg: string;
  text: string;
  divider: string;
  accent: string;
  selectionBg: string;
}

export const BOOK_THEMES: Record<BookTheme, BookThemeConfig> = {
  sepia: {
    id: 'sepia',
    name: 'Sepia Cálido',
    bg: '#FBF0D9',
    text: '#5F4B32',
    divider: '#E5D6BA',
    accent: '#8C6D46',
    selectionBg: '#F3DEB0',
  },
  crema: {
    id: 'crema',
    name: 'Crema Suave',
    bg: '#F5EBE1',
    text: '#453835',
    divider: '#DFD2C4',
    accent: '#7D645D',
    selectionBg: '#E9D7C5',
  },
  white: {
    id: 'white',
    name: 'Luz Diurna',
    bg: '#FFFFFF',
    text: '#18181B',
    divider: '#E4E4E7',
    accent: '#2563EB',
    selectionBg: '#DBEAFE',
  },
  slate: {
    id: 'slate',
    name: 'Pizarra Noche',
    bg: '#1E2024',
    text: '#D1D5DB',
    divider: '#2D3139',
    accent: '#60A5FA',
    selectionBg: '#374151',
  },
  oled: {
    id: 'oled',
    name: 'OLED Negro',
    bg: '#000000',
    text: '#D4D4D8',
    divider: '#27272A',
    accent: '#3B82F6',
    selectionBg: '#3F3F46',
  },
};

export type BookFontFamily = 'serif' | 'sans' | 'mono';

export interface BookPreferences {
  theme: BookTheme;
  fontFamily: BookFontFamily;
  fontSize: number; // 14 a 32 px
  lineHeight: number; // 1.4 a 2.2
  marginSize: 'compact' | 'normal' | 'wide';
  readingMode: 'paged' | 'scroll';
}

export const DEFAULT_BOOK_PREFERENCES: BookPreferences = {
  theme: 'sepia',
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.7,
  marginSize: 'normal',
  readingMode: 'paged',
};

export interface HighlightColorOption {
  id: string;
  name: string;
  color: string;
  bgRgba: string;
}

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
  { id: 'yellow', name: 'Amarillo', color: '#FACC15', bgRgba: 'rgba(250, 204, 21, 0.35)' },
  { id: 'green', name: 'Verde', color: '#4ADE80', bgRgba: 'rgba(74, 222, 128, 0.35)' },
  { id: 'blue', name: 'Azul', color: '#60A5FA', bgRgba: 'rgba(96, 165, 250, 0.35)' },
  { id: 'pink', name: 'Rosa', color: '#F472B6', bgRgba: 'rgba(244, 114, 182, 0.35)' },
  { id: 'orange', name: 'Naranja', color: '#FB923C', bgRgba: 'rgba(251, 146, 60, 0.35)' },
];
