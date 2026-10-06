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
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight m-0"
          style={{ color: 'var(--text-title)' }}
        >
          Métricas de lectura
        </h1>
        <p
          className="text-xs font-normal m-0 mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
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
              <div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{item.label}</span>
              </div>
              <span
                className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight"
                style={{ color: 'var(--text-title)' }}
              >
                {item.value}
              </span>
              <span
                className="text-[11px] mt-0.5 font-normal"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.sublabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gráfico 1: Estado de Lectura de la Colección (Lienzo continuo, sin cajas ni fondos) */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>
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
        <div
          className="flex flex-wrap items-center gap-5 text-xs pt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Leídos: <strong style={{ color: 'var(--text-title)' }}>{stats.completed}</strong> ({completedPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: primaryColor.hex }}
            />
            <span>En progreso: <strong style={{ color: 'var(--text-title)' }}>{stats.inProgress}</strong> ({inProgressPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>Por leer: <strong style={{ color: 'var(--text-title)' }}>{unreadCount}</strong> ({unreadPct}%)</span>
          </div>
        </div>
      </section>

      {/* Gráfico 2: Formatos de Archivos en Biblioteca */}
      <section className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>
            Formatos en biblioteca
          </span>
          <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
            {stats.total} archivos locales
          </span>
        </div>

        <div className="flex flex-col gap-4 max-w-2xl">
          {/* Barra CBZ */}
          <div>
            <div
              className="flex items-center justify-between text-xs mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>.cbz (zip)</span>
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
            <div
              className="flex items-center justify-between text-xs mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>.cbr (rar)</span>
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
        <div
          className="pt-2 text-xs flex items-center justify-between max-w-2xl"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>Páginas totales almacenadas en estantería:</span>
          <span className="font-bold" style={{ color: 'var(--text-title)' }}>{totalPages.toLocaleString()} páginas</span>
        </div>
      </section>
    </div>
  );
};
