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
  customTitleColor: string | null;
  customTextColor: string | null;
  customMutedColor: string | null;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPrimaryColor: (color: PrimaryColorOption) => void;
  setPrimaryHex: (hex: string) => void;
  setCustomBgColor: (hex: string | null) => void;
  setCustomTitleColor: (hex: string | null) => void;
  setCustomTextColor: (hex: string | null) => void;
  setCustomMutedColor: (hex: string | null) => void;
  resetColors: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_MODE = 'comicread_theme_mode';
const STORAGE_KEY_COLOR = 'comicread_theme_color';
const STORAGE_KEY_BG = 'comicread_theme_bg';
const STORAGE_KEY_TITLE = 'comicread_theme_title';
const STORAGE_KEY_TEXT = 'comicread_theme_text';
const STORAGE_KEY_MUTED = 'comicread_theme_muted';

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

function getInitialStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || null;
}

function applyTheme(
  mode: ThemeMode,
  color: PrimaryColorOption,
  customBg: string | null,
  customTitle: string | null,
  customText: string | null,
  customMuted: string | null
) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const effectiveBg = customBg || (mode === 'dark' ? '#0c0c0e' : '#ffffff');
  const isDark = isDarkColor(effectiveBg);

  // Valores predeterminados adaptativos de alto contraste
  const defaultTitle = isDark ? '#ffffff' : '#09090b';
  const defaultText = isDark ? '#f4f4f5' : '#18181b';
  const defaultMuted = isDark ? '#a1a1aa' : '#71717a';
  const defaultBorder = isDark ? '#27272a' : '#e4e4e7';

  const effectiveTitle = customTitle || defaultTitle;
  const effectiveText = customText || defaultText;
  const effectiveMuted = customMuted || defaultMuted;

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--bg-main', effectiveBg);
  root.style.setProperty('--text-title', effectiveTitle);
  root.style.setProperty('--text-main', effectiveText);
  root.style.setProperty('--text-muted', effectiveMuted);
  root.style.setProperty('--border-subtle', defaultBorder);
  root.style.setProperty('--primary-color', color.hex);
  root.style.setProperty('--primary-glow', 'transparent');

  root.style.backgroundColor = effectiveBg;
  root.style.color = effectiveText;
  document.body.style.backgroundColor = effectiveBg;
  document.body.style.color = effectiveText;

  // Actualizar meta theme-color para navegadores y WebView
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', effectiveBg);
  }

  // Sincronizar estilo e iconos de la barra de estado
  statusBarService.updateStatusBarStyle(isDark);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = getInitialMode();
  const initialColor = getInitialColor();
  const initialBg = getInitialStored(STORAGE_KEY_BG);
  const initialTitle = getInitialStored(STORAGE_KEY_TITLE);
  const initialText = getInitialStored(STORAGE_KEY_TEXT);
  const initialMuted = getInitialStored(STORAGE_KEY_MUTED);

  // Aplicar inmediatamente en inicialización
  applyTheme(
    initialMode,
    initialColor,
    initialBg,
    initialTitle,
    initialText,
    initialMuted
  );

  return {
    mode: initialMode,
    primaryColor: initialColor,
    customBgColor: initialBg,
    customTitleColor: initialTitle,
    customTextColor: initialText,
    customMutedColor: initialMuted,

    setMode: (mode: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      const state = get();
      applyTheme(
        mode,
        state.primaryColor,
        state.customBgColor,
        state.customTitleColor,
        state.customTextColor,
        state.customMutedColor
      );
      set({ mode });
    },

    toggleMode: () => {
      const nextMode = get().mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY_MODE, nextMode);
      const state = get();
      applyTheme(
        nextMode,
        state.primaryColor,
        state.customBgColor,
        state.customTitleColor,
        state.customTextColor,
        state.customMutedColor
      );
      set({ mode: nextMode });
    },

    setPrimaryColor: (color: PrimaryColorOption) => {
      localStorage.setItem(STORAGE_KEY_COLOR, color.hex);
      const state = get();
      applyTheme(
        state.mode,
        color,
        state.customBgColor,
        state.customTitleColor,
        state.customTextColor,
        state.customMutedColor
      );
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
      const state = get();
      applyTheme(
        state.mode,
        option,
        state.customBgColor,
        state.customTitleColor,
        state.customTextColor,
        state.customMutedColor
      );
      set({ primaryColor: option });
    },

    setCustomBgColor: (hex: string | null) => {
      if (hex) {
        localStorage.setItem(STORAGE_KEY_BG, hex);
      } else {
        localStorage.removeItem(STORAGE_KEY_BG);
      }
      const state = get();
      applyTheme(
        state.mode,
        state.primaryColor,
        hex,
        state.customTitleColor,
        state.customTextColor,
        state.customMutedColor
      );
      set({ customBgColor: hex });
    },

    setCustomTitleColor: (hex: string | null) => {
      if (hex) {
        localStorage.setItem(STORAGE_KEY_TITLE, hex);
      } else {
        localStorage.removeItem(STORAGE_KEY_TITLE);
      }
      const state = get();
      applyTheme(
        state.mode,
        state.primaryColor,
        state.customBgColor,
        hex,
        state.customTextColor,
        state.customMutedColor
      );
      set({ customTitleColor: hex });
    },

    setCustomTextColor: (hex: string | null) => {
      if (hex) {
        localStorage.setItem(STORAGE_KEY_TEXT, hex);
      } else {
        localStorage.removeItem(STORAGE_KEY_TEXT);
      }
      const state = get();
      applyTheme(
        state.mode,
        state.primaryColor,
        state.customBgColor,
        state.customTitleColor,
        hex,
        state.customMutedColor
      );
      set({ customTextColor: hex });
    },

    setCustomMutedColor: (hex: string | null) => {
      if (hex) {
        localStorage.setItem(STORAGE_KEY_MUTED, hex);
      } else {
        localStorage.removeItem(STORAGE_KEY_MUTED);
      }
      const state = get();
      applyTheme(
        state.mode,
        state.primaryColor,
        state.customBgColor,
        state.customTitleColor,
        state.customTextColor,
        hex
      );
      set({ customMutedColor: hex });
    },

    resetColors: () => {
      localStorage.removeItem(STORAGE_KEY_BG);
      localStorage.removeItem(STORAGE_KEY_TITLE);
      localStorage.removeItem(STORAGE_KEY_TEXT);
      localStorage.removeItem(STORAGE_KEY_MUTED);
      localStorage.removeItem(STORAGE_KEY_COLOR);
      const defaultColor = PRIMARY_COLORS[0];
      applyTheme(get().mode, defaultColor, null, null, null, null);
      set({
        primaryColor: defaultColor,
        customBgColor: null,
        customTitleColor: null,
        customTextColor: null,
        customMutedColor: null,
      });
    },

    resetToDefaults: () => {
      get().resetColors();
    },
  };
});
