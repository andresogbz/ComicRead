import React, { useMemo } from 'react';
import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface AnalyticsViewProps {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
  };
  comics: StoredComic[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, comics }) => {
  const { primaryColor } = useThemeStore();

  const totalPages = useMemo(
    () => comics.reduce((acc, c) => acc + (c.totalPages || 0), 0),
    [comics]
  );

  const pagesRead = useMemo(
    () =>
      comics.reduce(
        (acc, c) =>
          acc +
          (c.lastReadPageIndex > 0
            ? c.lastReadPageIndex + 1
            : c.progressPercentage >= 100
            ? c.totalPages
            : 0),
        0
      ),
    [comics]
  );

  const cbzCount = useMemo(
    () => comics.filter((c) => c.format === 'cbz').length,
    [comics]
  );

  const cbrCount = useMemo(
    () => comics.filter((c) => c.format === 'cbr').length,
    [comics]
  );

  const unreadCount = Math.max(0, stats.total - stats.completed - stats.inProgress);
  const completedPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const inProgressPct = stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0;
  const unreadPct = Math.max(0, 100 - completedPct - inProgressPct);

  const globalReadRate = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;

  const metricItems = [
    {
      label: 'En estantería',
      value: stats.total,
      sublabel: 'Cómics importados',
    },
    {
      label: 'En lectura activa',
      value: stats.inProgress,
      sublabel: 'Historias en curso',
    },
    {
      label: 'Páginas leídas',
      value: pagesRead > 0 ? pagesRead.toLocaleString() : '0',
      sublabel: `De ${totalPages.toLocaleString()} páginas`,
    },
    {
      label: 'Avance global',
      value: `${globalReadRate}%`,
      sublabel: 'De toda tu biblioteca',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 w-full max-w-full flex flex-col gap-8 pb-16">
      {/* Encabezado con divisor estilo menú */}
      <header className="pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-5 h-[1.5px]" style={{ backgroundColor: primaryColor.hex }} />
          <span
            className="text-xs font-semibold"
            style={{ color: primaryColor.hex }}
          >
            Análisis
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white m-0">
          Métricas de lectura
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal m-0 mt-1">
          Estadísticas detalladas y progreso global de tu colección
        </p>
      </header>

      {/* Métricas clave numéricas */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80">
          {metricItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'pr-3 sm:pr-6' : 'pl-3 sm:pl-6'
              } ${index < 2 ? 'pb-4 md:pb-0' : 'pt-4 md:pt-0'}`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span>{item.label}</span>
              </div>
              <span className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                {item.value}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">
                {item.sublabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gráfico 1: Estado de Lectura de la Colección (Lienzo continuo, sin cajas ni fondos) */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            Distribución de la colección
          </span>
          <span style={{ color: primaryColor.hex }}>
            {completedPct}% completado
          </span>
        </div>

        {/* Barra segmentada continua */}
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex gap-0.5">
          {completedPct > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${completedPct}%` }}
              title={`Completados: ${stats.completed}`}
            />
          )}
          {inProgressPct > 0 && (
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${inProgressPct}%`, backgroundColor: primaryColor.hex }}
              title={`En curso: ${stats.inProgress}`}
            />
          )}
          {unreadPct > 0 && (
            <div
              className="h-full bg-zinc-300 dark:bg-zinc-700 transition-all duration-300"
              style={{ width: `${unreadPct}%` }}
              title={`Por leer: ${unreadCount}`}
            />
          )}
        </div>

        {/* Leyenda con puntos de color y conteos */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Leídos: <strong className="text-zinc-900 dark:text-white">{stats.completed}</strong> ({completedPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: primaryColor.hex }}
            />
            <span>En progreso: <strong className="text-zinc-900 dark:text-white">{stats.inProgress}</strong> ({inProgressPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>Por leer: <strong className="text-zinc-900 dark:text-white">{unreadCount}</strong> ({unreadPct}%)</span>
          </div>
        </div>
      </section>

      {/* Gráfico 2: Formatos de Archivos en Biblioteca */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            Formatos en biblioteca
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">
            {stats.total} archivos locales
          </span>
        </div>

        <div className="flex flex-col gap-4 max-w-2xl">
          {/* Barra CBZ */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">.cbz (zip)</span>
              <span>{cbzCount} cómics ({stats.total > 0 ? Math.round((cbzCount / stats.total) * 100) : 0}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? (cbzCount / stats.total) * 100 : 0}%`,
                  backgroundColor: primaryColor.hex,
                }}
              />
            </div>
          </div>

          {/* Barra CBR */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">.cbr (rar)</span>
              <span>{cbrCount} cómics ({stats.total > 0 ? Math.round((cbrCount / stats.total) * 100) : 0}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? (cbrCount / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Resumen total de páginas */}
        <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between max-w-2xl">
          <span>Páginas totales almacenadas en estantería:</span>
          <span className="font-bold text-zinc-900 dark:text-white">{totalPages.toLocaleString()} páginas</span>
        </div>
      </section>
    </div>
  );
};
