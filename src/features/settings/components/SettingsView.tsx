import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  FolderSearch,
  Plus,
  Check,
  Download,
  Upload,
  Trash2,
  Keyboard,
} from 'lucide-react';
import { useThemeStore, PRIMARY_COLORS } from '../../../core/theme/useThemeStore';
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
  const { mode, toggleMode, primaryColor, setPrimaryColor } = useThemeStore();
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white m-0">
          Ajustes generales
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal m-0 mt-1">
          Personaliza la iluminación, el color de acento, respaldos de lectura y controles
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
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white m-0">
            Modo visual
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
            Selecciona la iluminación adecuada para tu lectura
          </p>
        </div>

        <div className="flex items-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => {
              if (mode === 'dark') toggleMode();
            }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer py-1 ${
              mode === 'light'
                ? 'text-zinc-900 dark:text-white underline underline-offset-8 decoration-2'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            style={mode === 'light' ? { textDecorationColor: primaryColor.hex } : undefined}
          >
            <Sun className="h-4 w-4 stroke-[2]" />
            <span>Modo claro</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode === 'light') toggleMode();
            }}
            className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer py-1 ${
              mode === 'dark'
                ? 'text-zinc-900 dark:text-white underline underline-offset-8 decoration-2'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            style={mode === 'dark' ? { textDecorationColor: primaryColor.hex } : undefined}
          >
            <Moon className="h-4 w-4 stroke-[2]" />
            <span>Modo oscuro</span>
          </button>
        </div>
      </section>

      {/* Sección 2: Color de acento primario */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white m-0">
            Color de acento
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
            Elige el color distintivo que acompañará tus barras de progreso y botones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 pt-1">
          {PRIMARY_COLORS.map((col) => {
            const isSelected = col.id === primaryColor.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setPrimaryColor(col)}
                className="flex items-center gap-2.5 transition-all cursor-pointer group"
                title={col.name}
              >
                <div
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-95 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-zinc-500 scale-110' : 'opacity-80 group-hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                >
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isSelected
                      ? 'font-bold text-zinc-900 dark:text-white'
                      : 'font-normal text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                  }`}
                >
                  {col.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sección 3: Almacenamiento y Cómics */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white m-0">
            Almacenamiento y biblioteca
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
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

      {/* Sección 4: Copia de Seguridad y Restauración */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white m-0">
            Copia de seguridad y persistencia
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
            Exporta o restaura todo tu historial de lectura, sagas, marcadores y configuración en un archivo ligero
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-white hover:border-zinc-500 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[1.75]" />
            <span>Exportar respaldo (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex h-10 items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-white hover:border-zinc-500 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="h-4 w-4 stroke-[1.75]" />
            <span>Restaurar respaldo (.json)</span>
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
          <Keyboard className="h-4 w-4 text-zinc-400" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white m-0">
            Atajos y control bluetooth
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0">
          Usa tu teclado físico, disparador bluetooth o botones de volumen para pasar de página
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-zinc-400">
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Página siguiente</span>
            <span className="font-mono text-[11px] text-zinc-200">Flecha Der, Espacio, J, L, Vol -</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Página anterior</span>
            <span className="font-mono text-[11px] text-zinc-200">Flecha Izq, Backspace, K, H, Vol +</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Guardar marcador</span>
            <span className="font-mono text-[11px] text-zinc-200">Tecla B</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Tira de miniaturas</span>
            <span className="font-mono text-[11px] text-zinc-200">Tecla M</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Modo doble página</span>
            <span className="font-mono text-[11px] text-zinc-200">Tecla D</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
            <span>Pantalla completa / Salir</span>
            <span className="font-mono text-[11px] text-zinc-200">Tecla F / Escape</span>
          </div>
        </div>
      </section>

      {/* Sección 6: Información de la Aplicación */}
      <section className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-col gap-1.5">
        <BrandLogo size="md" />
        <span>Gomic • Versión 1.0.15 • Lector de cómics minimalista de alto rendimiento</span>
        <span>Soporte para archivos .cbz, .cbr y formato Webtoon continuo</span>
      </section>
    </div>
  );
};
