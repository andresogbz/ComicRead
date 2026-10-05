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
    <div className="flex flex-col pb-8 sm:pb-10 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="mb-4">
        <span
          className="text-xs font-semibold"
          style={{ color: primaryColor.hex }}
        >
          Flujo de trabajo
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white m-0 mt-1">
          Acciones rápidas
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5 font-normal">
          Operaciones directas para gestionar y organizar tu colección
        </p>
      </div>

      {/* Lista separada por divisores lineales ligeros, sin tarjetas ni recuadros */}
      <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 border-t border-b border-zinc-200/80 dark:border-zinc-800/80">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          return (
            <div
              key={task.id}
              onClick={task.action}
              className="flex items-center justify-between gap-4 py-3.5 px-1 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Icono con color uniforme de la paleta, plano sin fondo */}
                <IconComponent
                  className="h-4 w-4 stroke-[2] shrink-0"
                  style={{ color: primaryColor.hex }}
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white m-0 truncate group-hover:opacity-90">
                    {task.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal m-0 mt-0.5 leading-relaxed line-clamp-1">
                    {task.description}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-1.5 text-xs font-semibold shrink-0"
                style={{ color: primaryColor.hex }}
              >
                <span className="hidden sm:inline">{task.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2] transition-transform duration-150 group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
