import React from 'react';
import {
  FolderSearch,
  Plus,
  Compass,
  Palette,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface QuickTasksMenuProps {
  onPickFiles: () => void;
  onScanDirectory: () => void;
  onGoToLibrary: () => void;
  onResumeReading?: () => void;
  hasComicsInProgress: boolean;
}

export const QuickTasksMenu: React.FC<QuickTasksMenuProps> = ({
  onPickFiles,
  onScanDirectory,
  onGoToLibrary,
  onResumeReading,
  hasComicsInProgress,
}) => {
  const { primaryColor } = useThemeStore();

  const tasks = [
    ...(hasComicsInProgress && onResumeReading
      ? [
          {
            id: 'resume',
            title: 'Retomar lectura activa',
            description: 'Continúa en la página exacta de tu cómic en curso.',
            action: onResumeReading,
            actionLabel: 'Reanudar',
            icon: Play,
            color: primaryColor.hex,
          },
        ]
      : []),
    {
      id: 'scan',
      title: 'Escanear carpeta local',
      description: 'Detecta automáticamente colecciones y cómics en tu almacenamiento.',
      action: onScanDirectory,
      actionLabel: 'Escanear',
      icon: FolderSearch,
      color: '#0ea5e9',
    },
    {
      id: 'import',
      title: 'Importar cómics (.cbz, .cbr)',
      description: 'Añade archivos individuales o selecciona varios cómics a la vez.',
      action: onPickFiles,
      actionLabel: 'Seleccionar',
      icon: Plus,
      color: primaryColor.hex,
    },
    {
      id: 'explore',
      title: 'Explorar la Biblioteca',
      description: 'Filtra por no leídos, completados, favoritos y busca por título.',
      action: onGoToLibrary,
      actionLabel: 'Ver catálogo',
      icon: Compass,
      color: '#10b981',
    },
    {
      id: 'theme',
      title: 'Ajustar color y modo',
      description: 'Elige entre 6 tonos primarios vibrantes y alterna entre modo claro u oscuro.',
      action: () => {
        const toggleBtn = document.querySelector('button[aria-label="Elegir color primario"]') as HTMLButtonElement | null;
        if (toggleBtn) toggleBtn.click();
      },
      actionLabel: 'Personalizar',
      icon: Palette,
      color: '#d946ef',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white m-0">
            Cosas por hacer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
            Acciones rápidas para gestionar y disfrutar tus lecturas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <div
              key={task.id}
              onClick={task.action}
              className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Icono desnudo sin recuadro detrás */}
                <IconComponent
                  className="h-5 w-5 stroke-[2] shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                  style={{ color: task.color }}
                />
                <div className="flex flex-col">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white group-hover:opacity-90 transition-opacity m-0">
                    {task.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal m-0 mt-0.5 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0 self-center transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: task.color }}>
                <span className="hidden sm:inline">{task.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
