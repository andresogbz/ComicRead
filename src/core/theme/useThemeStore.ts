import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

export interface PrimaryColorOption {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const PRIMARY_COLORS: PrimaryColorOption[] = [
  { id: 'violet', name: 'Violeta', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.25)' },
  { id: 'blue', name: 'Azul Eléctrico', hex: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.25)' },
  { id: 'emerald', name: 'Esmeralda', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
  { id: 'rose', name: 'Carmesí', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)' },
  { id: 'amber', name: 'Ámbar', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' },
  { id: 'fuchsia', name: 'Fucsia', hex: '#d946ef', glow: 'rgba(217, 70, 239, 0.25)' },
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
