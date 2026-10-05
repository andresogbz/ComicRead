import React from 'react';
import { BookCopy, BookOpen, CheckCircle2, Heart } from 'lucide-react';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface DashboardStatsProps {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    favorites: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const { primaryColor } = useThemeStore();

  const items = [
    {
      label: 'En estantería',
      value: stats.total,
      sublabel: 'Almacenamiento local',
      icon: BookCopy,
    },
    {
      label: 'En lectura',
      value: stats.inProgress,
      sublabel: 'Lecturas activas',
      icon: BookOpen,
    },
    {
      label: 'Completados',
      value: stats.completed,
      sublabel: 'Cómics terminados',
      icon: CheckCircle2,
    },
    {
      label: 'Favoritos',
      value: stats.favorites,
      sublabel: 'Historias destacadas',
      icon: Heart,
    },
  ];

  return (
    <div className="pb-8 sm:pb-10 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: primaryColor.hex }}
        >
          Métricas de Lectura
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'pr-3 sm:pr-6' : 'pl-3 sm:pl-6'
              } ${index < 2 ? 'pb-4 md:pb-0' : 'pt-4 md:pt-0'}`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <IconComponent
                  className="h-3.5 w-3.5 stroke-[2]"
                  style={{ color: primaryColor.hex }}
                />
                <span>{item.label}</span>
              </div>
              <span className="mt-1.5 text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                {item.value}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">
                {item.sublabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
