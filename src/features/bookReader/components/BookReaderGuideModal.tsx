import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Sliders,
  Bookmark,
  MousePointerClick,
  Check,
} from 'lucide-react';

interface BookReaderGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_STEPS = [
  {
    title: 'Navegación táctil de lectura',
    subtitle: 'Zonas interactivas de la pantalla',
    icon: MousePointerClick,
    description:
      'Pasa de página o muestra los menús tocando diferentes zonas de la pantalla:',
    tips: [
      'Lateral izquierdo (30%): Retroceder a la página anterior.',
      'Centro de la pantalla (40%): Mostrar u ocultar la barra de menús y herramientas.',
      'Lateral derecho (30%): Avanzar a la página siguiente.',
      'Gesto táctil: También puedes deslizar horizontalmente con el dedo para pasar de página.',
    ],
  },
  {
    title: 'Resaltado y marcatextos en tablets',
    subtitle: 'Cómo subrayar texto sin conflictos',
    icon: Highlighter,
    description:
      'En tablets y móviles, el sistema operativo muestra su menú nativo (Copiar, Compartir). Para resaltar en ComicRead:',
    tips: [
      '1. Mantén presionado cualquier texto con el dedo para seleccionarlo con los tiradores.',
      '2. Al seleccionar, aparecerá la barra de marcatextos de ComicRead en la parte inferior de la pantalla.',
      '3. Elige tu color favorito y pulsa Resaltar. El texto quedará guardado automáticamente.',
      '4. También puedes usar el selector de marcatextos activo en la barra inferior del menú.',
    ],
  },
  {
    title: 'Resaltados, notas y marcadores',
    subtitle: 'Tu biblioteca de citas personales',
    icon: Bookmark,
    description:
      'Gestiona tus lecturas y citas importantes desde la barra superior:',
    tips: [
      'Icono de marcador: Guarda la página o capítulo actual para retomarlo después.',
      'Icono de marcatextos: Abre el listado completo de todas tus citas resaltadas.',
      'Notas personales: En la lista de resaltados puedes agregar comentarios a cualquier fragmento.',
      'Navegación directa: Toca cualquier cita guardada para saltar inmediatamente a esa página.',
    ],
  },
  {
    title: 'Personalización de colores y tipografía',
    subtitle: 'Lectura cómoda a tu medida',
    icon: Sliders,
    description:
      'Configura el lector a tu preferencia desde el icono de ajustes:',
    tips: [
      'Temas rápidos: Sepia cálido, Crema suave, Luz diurna, Pizarra noche y OLED negro puro.',
      'Color Picker interactivo: Personaliza manualmente el fondo, texto, títulos y acento.',
      'Tamaño e interlineado: Ajusta la fuente de 14 a 32 px y el espaciado de línea.',
      'Columnas y márgenes: Elige 1 o 2 columnas en tablets y aprovecha todo el ancho de pantalla.',
    ],
  },
];

export const BookReaderGuideModal: React.FC<BookReaderGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === GUIDE_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('comicread_book_guide_dismissed', 'true');
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('comicread_book_guide_dismissed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-950 text-zinc-100 flex flex-col border-t border-b border-zinc-800">
        {/* Encabezado sin recuadros */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <StepIcon className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 m-0">
              Guía de uso del lector
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar guía"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido del paso actual */}
        <div className="flex flex-col gap-4 px-5 py-5 min-h-[260px]">
          {/* Título y subtítulo */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">
                {step.title}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {currentStep + 1} de {GUIDE_STEPS.length}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {step.subtitle}
            </span>
          </div>

          {/* Explicación */}
          <p className="text-xs text-zinc-300 leading-relaxed m-0">
            {step.description}
          </p>

          {/* Lista de puntos clave */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior de navegación de la guía */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Omitir guía
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <span>{isLast ? 'Entendido' : 'Siguiente'}</span>
              {isLast ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
