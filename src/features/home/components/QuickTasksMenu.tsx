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
    },
    {
      id: 'import',
      title: 'Importar cómics (.cbz, .cbr)',
      description: 'Añade archivos individuales o selecciona varios cómics a la vez.',
      action: onPickFiles,
      actionLabel: 'Seleccionar',
      icon: Plus,
    },
    {
      id: 'explore',
      title: 'Explorar la Biblioteca',
      description: 'Filtra por no leídos, completados, favoritos y busca por título.',
      action: onGoToLibrary,
      actionLabel: 'Ver catálogo',
      icon: Compass,
    },
    {
      id: 'theme',
      title: 'Ajustar color y modo',
      description: 'Elige entre tonos primarios y alterna entre modo claro u oscuro.',
      action: () => {
        const toggleBtn = document.querySelector('button[aria-label="Elegir color primario"]') as HTMLButtonElement | null;
        if (toggleBtn) toggleBtn.click();
      },
      actionLabel: 'Personalizar',
      icon: Palette,
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white m-0">
            Cosas por hacer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5 font-normal">
            Acciones rápidas para gestionar y disfrutar tus lecturas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <div
              key={task.id}
              onClick={task.action}
              className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3.5">
                {/* Icono con color uniforme de la paleta, sin fondo */}
                <IconComponent
                  className="h-5 w-5 stroke-[2] shrink-0 mt-0.5"
                  style={{ color: primaryColor.hex }}
                />
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white m-0">
                    {task.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal m-0 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-1 text-xs font-semibold shrink-0"
                style={{ color: primaryColor.hex }}
              >
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
