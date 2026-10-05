import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

export interface PrimaryColorOption {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const PRIMARY_COLORS: PrimaryColorOption[] = [
  { id: 'violet', name: 'Índigo', hex: '#6366f1', glow: 'transparent' },
  { id: 'blue', name: 'Azul Marino', hex: '#2563eb', glow: 'transparent' },
  { id: 'emerald', name: 'Verde Bosque', hex: '#059669', glow: 'transparent' },
  { id: 'rose', name: 'Carmesí', hex: '#e11d48', glow: 'transparent' },
  { id: 'amber', name: 'Terracota', hex: '#d97706', glow: 'transparent' },
  { id: 'fuchsia', name: 'Púrpura', hex: '#9333ea', glow: 'transparent' },
];

interface ThemeState {
  mode: ThemeMode;
  primaryColor: PrimaryColorOption;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPrimaryColor: (color: PrimaryColorOption) => void;
}

const STORAGE_KEY_MODE = 'comicread_theme_mode';
const STORAGE_KEY_COLOR = 'comicread_theme_color';

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getInitialColor(): PrimaryColorOption {
  if (typeof window === 'undefined') return PRIMARY_COLORS[0];
  const storedId = localStorage.getItem(STORAGE_KEY_COLOR);
  const found = PRIMARY_COLORS.find((c) => c.id === storedId);
  return found || PRIMARY_COLORS[0];
}

function applyTheme(mode: ThemeMode, color: PrimaryColorOption) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Alternar clase dark
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Establecer variables CSS de color primario y resplandor
  root.style.setProperty('--primary-color', color.hex);
  root.style.setProperty('--primary-glow', color.glow);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = getInitialMode();
  const initialColor = getInitialColor();

  // Aplicar inmediatamente en inicialización
  applyTheme(initialMode, initialColor);

  return {
    mode: initialMode,
    primaryColor: initialColor,

    setMode: (mode: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      applyTheme(mode, get().primaryColor);
      set({ mode });
    },

    toggleMode: () => {
      const nextMode = get().mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY_MODE, nextMode);
      applyTheme(nextMode, get().primaryColor);
      set({ mode: nextMode });
    },

    setPrimaryColor: (primaryColor: PrimaryColorOption) => {
      localStorage.setItem(STORAGE_KEY_COLOR, primaryColor.id);
      applyTheme(get().mode, primaryColor);
      set({ primaryColor });
    },
  };
});
