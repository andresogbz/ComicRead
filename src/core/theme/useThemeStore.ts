import { create } from 'zustand';
import { statusBarService } from '../../shared/services/statusBarService';

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

export function isDarkColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 135;
}

interface ThemeState {
  mode: ThemeMode;
  primaryColor: PrimaryColorOption;
  customBgColor: string | null;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPrimaryColor: (color: PrimaryColorOption) => void;
  setPrimaryHex: (hex: string) => void;
  setCustomBgColor: (hex: string | null) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_MODE = 'comicread_theme_mode';
const STORAGE_KEY_COLOR = 'comicread_theme_color';
const STORAGE_KEY_BG = 'comicread_theme_bg';

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getInitialColor(): PrimaryColorOption {
  if (typeof window === 'undefined') return PRIMARY_COLORS[0];
  const storedVal = localStorage.getItem(STORAGE_KEY_COLOR);
  if (!storedVal) return PRIMARY_COLORS[0];

  const found = PRIMARY_COLORS.find(
    (c) => c.id === storedVal || c.hex.toLowerCase() === storedVal.toLowerCase()
  );
  if (found) return found;

  if (storedVal.startsWith('#')) {
    return { id: 'custom', name: 'Personalizado', hex: storedVal, glow: 'transparent' };
  }

  return PRIMARY_COLORS[0];
}

function getInitialBg(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_BG) || null;
}

function applyTheme(mode: ThemeMode, color: PrimaryColorOption, customBg: string | null) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const effectiveBg = customBg || (mode === 'dark' ? '#0c0c0e' : '#ffffff');
  const isDark = isDarkColor(effectiveBg);

  if (isDark) {
    root.classList.add('dark');
    root.style.setProperty('--bg-main', effectiveBg);
    root.style.setProperty('--text-main', '#f4f4f5');
    root.style.setProperty('--text-muted', '#a1a1aa');
    root.style.setProperty('--border-subtle', '#27272a');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--bg-main', effectiveBg);
    root.style.setProperty('--text-main', '#111111');
    root.style.setProperty('--text-muted', '#71717a');
    root.style.setProperty('--border-subtle', '#e4e4e7');
  }

  root.style.setProperty('--primary-color', color.hex);
  root.style.setProperty('--primary-glow', 'transparent');
  document.body.style.backgroundColor = effectiveBg;

  // Sincronizar estilo e iconos de la barra de estado
  statusBarService.updateStatusBarStyle(isDark);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = getInitialMode();
  const initialColor = getInitialColor();
  const initialBg = getInitialBg();

  // Aplicar inmediatamente en inicialización
  applyTheme(initialMode, initialColor, initialBg);

  return {
    mode: initialMode,
    primaryColor: initialColor,
    customBgColor: initialBg,

    setMode: (mode: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      applyTheme(mode, get().primaryColor, get().customBgColor);
      set({ mode });
    },

    toggleMode: () => {
      const nextMode = get().mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY_MODE, nextMode);
      applyTheme(nextMode, get().primaryColor, get().customBgColor);
      set({ mode: nextMode });
    },

    setPrimaryColor: (color: PrimaryColorOption) => {
      localStorage.setItem(STORAGE_KEY_COLOR, color.hex);
      applyTheme(get().mode, color, get().customBgColor);
      set({ primaryColor: color });
    },

    setPrimaryHex: (hex: string) => {
      const option: PrimaryColorOption = {
        id: 'custom',
        name: 'Personalizado',
        hex,
        glow: 'transparent',
      };
      localStorage.setItem(STORAGE_KEY_COLOR, hex);
      applyTheme(get().mode, option, get().customBgColor);
      set({ primaryColor: option });
    },

    setCustomBgColor: (hex: string | null) => {
      if (hex) {
        localStorage.setItem(STORAGE_KEY_BG, hex);
      } else {
        localStorage.removeItem(STORAGE_KEY_BG);
      }
      applyTheme(get().mode, get().primaryColor, hex);
      set({ customBgColor: hex });
    },

    resetToDefaults: () => {
      localStorage.removeItem(STORAGE_KEY_BG);
      localStorage.removeItem(STORAGE_KEY_COLOR);
      const defaultColor = PRIMARY_COLORS[0];
      applyTheme(get().mode, defaultColor, null);
      set({
        primaryColor: defaultColor,
        customBgColor: null,
      });
    },
  };
});
