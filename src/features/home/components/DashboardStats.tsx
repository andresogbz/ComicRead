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
      icon: BookCopy,
    },
    {
      label: 'En lectura',
      value: stats.inProgress,
      icon: BookOpen,
    },
    {
      label: 'Completados',
      value: stats.completed,
      icon: CheckCircle2,
    },
    {
      label: 'Favoritos',
      value: stats.favorites,
      icon: Heart,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="flex flex-col p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {item.label}
              </span>
              {/* Icono en color único y uniforme de la paleta, sin fondo */}
              <IconComponent
                className="h-4 w-4 stroke-[2]"
                style={{ color: primaryColor.hex }}
              />
            </div>
            <span className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
