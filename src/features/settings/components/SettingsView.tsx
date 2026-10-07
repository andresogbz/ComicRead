import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  FolderSearch,
  Plus,
  Download,
  Upload,
  Trash2,
  Keyboard,
  RotateCcw,
} from 'lucide-react';
import { useThemeStore, isDarkColor } from '../../../core/theme/useThemeStore';
import { BrandLogo } from '../../../shared/components/BrandLogo';
import { backupService } from '../services/backupService';
import { readerCache } from '../../reader/services/readerCacheService';
import { useLibraryStore } from '../../library/stores/useLibraryStore';

interface SettingsViewProps {
  onPickFiles: () => void;
  onScanDirectory: () => void;
  isScanning: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onPickFiles,
  onScanDirectory,
  isScanning,
}) => {
  const {
    mode,
    toggleMode,
    primaryColor,
    customBgColor,
    customTitleColor,
    customTextColor,
    customMutedColor,
    customButtonTextColor,
    setCustomBgColor,
    setCustomTitleColor,
    setCustomTextColor,
    setCustomMutedColor,
    setCustomButtonTextColor,
    setPrimaryHex,
    resetColors,
  } = useThemeStore();
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleExportBackup = async () => {
    try {
      setIsProcessing(true);
      await backupService.exportBackup();
      showStatus('Copia de seguridad descargada exitosamente en formato JSON.');
    } catch (err: any) {
      showStatus(`Error exportando copia: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const result = await backupService.importBackup(file);
      await loadLibrary();
      showStatus(
        `Restauración completa: ${result.updatedCount} cómics actualizados, ${result.restoredCount} nuevos registros incorporados.`
      );
    } catch (err: any) {
      showStatus(`Error restaurando copia: ${err?.message || 'Archivo no compatible'}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearCache = () => {
    readerCache.clearAll();
    showStatus('Memoria caché temporal y recursos de lectura liberados.');
  };

  const handleSaveAutoBackupNow = async () => {
    try {
      setIsProcessing(true);
      const success = await backupService.saveAutoBackupToDocuments();
      if (success) {
        showStatus('Copia guardada con éxito en Documents/Gomic. Tus datos sobrevivirán a la desinstalación.');
      } else {
        showStatus('Copia guardada en el almacenamiento local persistente.');
      }
    } catch (err: any) {
      showStatus(`Error guardando auto-respaldo: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreFromStorageBackup = async () => {
    try {
      setIsProcessing(true);
      const result = await backupService.restoreFromStorageBackup();
      await loadLibrary();
      showStatus(
        `Restauración automática exitosa: ${result.updatedCount} actualizados, ${result.restoredCount} registros recuperados.`
      );
    } catch (err: any) {
      showStatus(`No se pudo restaurar: ${err?.message || 'No se encontró respaldo persistente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 w-full max-w-full flex flex-col gap-8 pb-16 select-none">
      {/* Encabezado con divisor estilo menú lateral */}
      <header className="pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-5 h-[1.5px]" style={{ backgroundColor: primaryColor.hex }} />
          <span
            className="text-xs font-semibold"
            style={{ color: primaryColor.hex }}
          >
            Configuración
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight m-0"
          style={{ color: 'var(--text-title)' }}
        >
          Ajustes generales
        </h1>
        <p
          className="text-xs font-normal m-0 mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Personaliza iluminación, colores de textos, fondo, acento y respaldos de lectura
        </p>
      </header>

      {/* Notificación de estado temporal plana */}
      {statusMessage && (
        <div className="flex items-center justify-between gap-3 bg-zinc-900 border-l-2 py-3 px-4 text-xs text-zinc-200 transition-all"
             style={{ borderLeftColor: primaryColor.hex }}>
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      )}

      {/* Sección 1: Modo visual */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2
            className="text-base sm:text-lg font-bold m-0"
            style={{ color: 'var(--text-title)' }}
          >
            Modo visual
          </h2>
          <p
            className="text-xs m-0 mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Selecciona la iluminación base para tu lectura
          </p>
        </div>

        <div className="flex items-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => {
              if (mode === 'dark') toggleMode();
            }}
            className="flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer py-1"
            style={{
              color: mode === 'light' ? 'var(--text-title)' : 'var(--text-muted)',
              textDecoration: mode === 'light' ? 'underline' : 'none',
              textUnderlineOffset: '8px',
              textDecorationColor: primaryColor.hex,
            }}
          >
            <Sun className="h-4 w-4 stroke-[2]" />
            <span>Modo claro</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode === 'light') toggleMode();
            }}
            className="flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer py-1"
            style={{
              color: mode === 'dark' ? 'var(--text-title)' : 'var(--text-muted)',
              textDecoration: mode === 'dark' ? 'underline' : 'none',
              textUnderlineOffset: '8px',
              textDecorationColor: primaryColor.hex,
            }}
          >
            <Moon className="h-4 w-4 stroke-[2]" />
            <span>Modo oscuro</span>
          </button>
        </div>
      </section>

      {/* Sección 2: Paleta y Colores (Fondo, Títulos, Textos y Acento) */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2
              className="text-base sm:text-lg font-bold m-0"
              style={{ color: 'var(--text-title)' }}
            >
              Colores y personalización visual
            </h2>
            <p
              className="text-xs m-0 mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Selecciona el color exacto para el fondo continuo, títulos, textos normales y acento
            </p>
          </div>

          {(customBgColor || customTitleColor || customTextColor || customMutedColor || customButtonTextColor || primaryColor.hex.toLowerCase() !== '#6366f1') && (
            <button
              type="button"
              onClick={resetColors}
              className="flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 hover:opacity-80 transition-opacity cursor-pointer self-start sm:self-center"
              style={{ color: 'var(--text-muted)' }}
              title="Restablecer toda la paleta a los valores originales"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer todo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* 1. Color de Fondo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de fondo
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Lienzo de la app y barra de estado
                </p>
              </div>
              {customBgColor && (
                <button
                  type="button"
                  onClick={() => setCustomBgColor(null)}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: customBgColor || (mode === 'dark' ? '#0c0c0e' : '#ffffff') }}
                />
                <input
                  type="color"
                  value={customBgColor || (mode === 'dark' ? '#0c0c0e' : '#ffffff')}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={(customBgColor || (mode === 'dark' ? '#0C0C0E' : '#FFFFFF')).toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setCustomBgColor(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#0C0C0E"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>

          {/* 2. Color de Títulos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de títulos
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Títulos de obras, secciones y logo
                </p>
              </div>
              {customTitleColor && (
                <button
                  type="button"
                  onClick={() => setCustomTitleColor(null)}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: customTitleColor || (mode === 'dark' ? '#ffffff' : '#09090b') }}
                />
                <input
                  type="color"
                  value={customTitleColor || (mode === 'dark' ? '#ffffff' : '#09090b')}
                  onChange={(e) => setCustomTitleColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={(customTitleColor || (mode === 'dark' ? '#FFFFFF' : '#09090B')).toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setCustomTitleColor(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#FFFFFF"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>

          {/* 3. Color de Texto Principal */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de texto normal
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Párrafos, descripciones y cuerpo
                </p>
              </div>
              {customTextColor && (
                <button
                  type="button"
                  onClick={() => setCustomTextColor(null)}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: customTextColor || (mode === 'dark' ? '#f4f4f5' : '#18181b') }}
                />
                <input
                  type="color"
                  value={customTextColor || (mode === 'dark' ? '#f4f4f5' : '#18181b')}
                  onChange={(e) => setCustomTextColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={(customTextColor || (mode === 'dark' ? '#F4F4F5' : '#18181B')).toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setCustomTextColor(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#F4F4F5"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>

          {/* 4. Color de Texto Secundario / Detalles */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de texto secundario
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Metadatos, páginas leídas y leyendas
                </p>
              </div>
              {customMutedColor && (
                <button
                  type="button"
                  onClick={() => setCustomMutedColor(null)}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: customMutedColor || (mode === 'dark' ? '#a1a1aa' : '#71717a') }}
                />
                <input
                  type="color"
                  value={customMutedColor || (mode === 'dark' ? '#a1a1aa' : '#71717a')}
                  onChange={(e) => setCustomMutedColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={(customMutedColor || (mode === 'dark' ? '#A1A1AA' : '#71717A')).toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setCustomMutedColor(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#A1A1AA"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>

          {/* 5. Color de Acentuación (Fondo de botones) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de acentuación
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Fondo de botones principales y badges
                </p>
              </div>
              {primaryColor.hex.toLowerCase() !== '#6366f1' && (
                <button
                  type="button"
                  onClick={() => setPrimaryHex('#6366f1')}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: primaryColor.hex }}
                />
                <input
                  type="color"
                  value={primaryColor.hex}
                  onChange={(e) => setPrimaryHex(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={primaryColor.hex.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setPrimaryHex(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#6366F1"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>

          {/* 6. Color de Texto de Botones */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold m-0" style={{ color: 'var(--text-title)' }}>
                  Color de texto en botones
                </h3>
                <p className="text-[11px] sm:text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Texto e iconos dentro de botones y acciones
                </p>
              </div>
              {customButtonTextColor && (
                <button
                  type="button"
                  onClick={() => setCustomButtonTextColor(null)}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Predeterminado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <label className="relative flex items-center justify-center cursor-pointer group shrink-0">
                <div
                  className="h-9 w-9 rounded-full border border-zinc-300/60 dark:border-zinc-700/60 transition-transform active:scale-95 group-hover:scale-105"
                  style={{ backgroundColor: customButtonTextColor || (isDarkColor(primaryColor.hex) ? '#ffffff' : '#09090b') }}
                />
                <input
                  type="color"
                  value={customButtonTextColor || (isDarkColor(primaryColor.hex) ? '#ffffff' : '#09090b')}
                  onChange={(e) => setCustomButtonTextColor(e.target.value)}
                  className="sr-only"
                />
              </label>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={(customButtonTextColor || (isDarkColor(primaryColor.hex) ? '#FFFFFF' : '#09090B')).toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 7) setCustomButtonTextColor(val);
                    }
                  }}
                  className="font-mono text-xs font-semibold bg-transparent border-b border-zinc-300 dark:border-zinc-700 w-24 focus:outline-none"
                  style={{ color: 'var(--text-title)', borderBottomColor: primaryColor.hex }}
                  placeholder="#FFFFFF"
                />
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Toca el círculo para selector
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Almacenamiento y Cómics */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2
            className="text-base sm:text-lg font-bold m-0"
            style={{ color: 'var(--text-title)' }}
          >
            Almacenamiento y biblioteca
          </h2>
          <p
            className="text-xs m-0 mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Gestiona la indexación de tus archivos locales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            onClick={onPickFiles}
            className="flex h-10 items-center gap-2 rounded-full px-5 text-xs font-semibold text-white active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor.hex }}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Agregar cómics</span>
          </button>

          <button
            type="button"
            onClick={onScanDirectory}
            disabled={isScanning}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FolderSearch className="h-4 w-4 stroke-[1.75]" />
            <span>{isScanning ? 'Escaneando almacenamiento...' : 'Escanear carpeta'}</span>
          </button>
        </div>
      </section>

      {/* Sección 4: Copia de Seguridad y Persistencia */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2
            className="text-base sm:text-lg font-bold m-0"
            style={{ color: 'var(--text-title)' }}
          >
            Copia de seguridad y persistencia
          </h2>
          <p
            className="text-xs m-0 mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Tus datos de lectura, libros, resaltados y sagas se guardan automáticamente en Documents/Gomic para que no se pierdan al desinstalar la app.
          </p>
        </div>

        {/* Acciones principales de auto-respaldo y archivos */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveAutoBackupNow}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[1.75]" />
            <span>Guardar en Documents/Gomic</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreFromStorageBackup}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="h-4 w-4 stroke-[1.75]" />
            <span>Restaurar de Documents/Gomic</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[1.75]" />
            <span>Exportar archivo (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="h-4 w-4 stroke-[1.75]" />
            <span>Importar archivo (.json)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleClearCache}
            className="flex h-10 items-center gap-2 rounded-full px-5 text-xs font-medium text-zinc-500 hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4 stroke-[1.75]" />
            <span>Liberar memoria caché</span>
          </button>
        </div>
      </section>

      {/* Sección 5: Atajos de Teclado y Mandos Bluetooth */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-base sm:text-lg font-bold m-0"
            style={{ color: 'var(--text-title)' }}
          >
            Atajos y control bluetooth
          </h2>
        </div>
        <p
          className="text-xs m-0"
          style={{ color: 'var(--text-muted)' }}
        >
          Usa tu teclado físico, disparador bluetooth o botones de volumen para pasar de página
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Página siguiente</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Flecha Der, Espacio, J, L, Vol -</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Página anterior</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Flecha Izq, Backspace, K, H, Vol +</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Guardar marcador</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Tecla B</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Tira de miniaturas</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Tecla M</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Modo doble página</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Tecla D</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Pantalla completa / Salir</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-title)' }}>Tecla F / Escape</span>
          </div>
        </div>
      </section>

      {/* Sección 6: Información de la Aplicación */}
      <section
        className="text-xs flex flex-col gap-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        <BrandLogo size="md" />
        <span>Gomic • Versión 1.0.24 • Lector de cómics y libros minimalista de alto rendimiento</span>
        <span>Soporte para cómics (.cbz, .cbr, .pdf) y libros (.epub, .txt) con marcatextos integrado</span>
      </section>
    </div>
  );
};
