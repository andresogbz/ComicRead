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
      color: primaryColor.hex,
    },
    {
      label: 'En lectura',
      value: stats.inProgress,
      icon: BookOpen,
      color: '#0ea5e9',
    },
    {
      label: 'Completados',
      value: stats.completed,
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      label: 'Favoritos',
      value: stats.favorites,
      icon: Heart,
      color: '#f43f5e',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="flex flex-col p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {item.label}
              </span>
              <IconComponent
                className="h-4 w-4 stroke-[2]"
                style={{ color: item.color }}
              />
            </div>
            <span className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
