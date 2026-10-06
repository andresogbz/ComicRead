import React from 'react';
import { Sun, Moon, FolderSearch, Plus, Check } from 'lucide-react';
import { useThemeStore, PRIMARY_COLORS } from '../../../core/theme/useThemeStore';
import { BrandLogo } from '../../../shared/components/BrandLogo';

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

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 w-full max-w-full flex flex-col gap-8 pb-16">
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
          Personaliza la iluminación, el color de acento y el almacenamiento local
        </p>
      </header>

      {/* Sección 1: Modo visual (Lienzo continuo, sin cajas contenedoras) */}
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

      {/* Sección 2: Color de acento primario (sin cajas ni fondos adicionales) */}
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

      {/* Sección 4: Información de la Aplicación */}
      <section className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-col gap-1.5">
        <BrandLogo size="md" />
        <span>Gomic • Versión 1.0.13 • Lector de cómics minimalista de alto rendimiento</span>
        <span>Soporte para archivos .cbz, .cbr y formato Webtoon continuo</span>
      </section>
    </div>
  );
};
