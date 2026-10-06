import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../core/theme/useThemeStore';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { primaryColor } = useThemeStore();

  useEffect(() => {
    // Breve presentación personalizada para sincronía visual limpia
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        onFinish?.();
      }, 350);
      return () => clearTimeout(removeTimer);
    }, 650);

    return () => clearTimeout(fadeTimer);
  }, [onFinish]);

  if (isRemoved) return null;

  return (
    <aside
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0C0E] select-none transition-opacity duration-300 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Isotipo distintivo Go. con tipografía mediana */}
        <div className="inline-flex items-center font-brand font-medium text-6xl sm:text-7xl tracking-tight text-[#F4F4F5] mb-2">
          <span>Go</span>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full ml-1.5 transition-colors"
            style={{ backgroundColor: primaryColor.hex }}
          />
        </div>

        {/* Nombre completo de la aplicación */}
        <span className="font-brand font-medium text-lg text-zinc-300 tracking-normal mb-3">
          Gomic
        </span>

        {/* Separador lineal sutil */}
        <div className="w-9 h-[1px] bg-zinc-800 mb-2.5" />

        {/* Subtítulo descriptivo */}
        <span className="text-xs text-zinc-500 font-normal">
          Lector de cómics
        </span>
      </div>

      {/* Indicador de carga sutil e integrado */}
      <div className="absolute bottom-12 w-24 h-[1.5px] bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-pulse w-full"
          style={{ backgroundColor: primaryColor.hex }}
        />
      </div>
    </aside>
  );
};
