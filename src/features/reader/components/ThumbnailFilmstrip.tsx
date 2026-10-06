import React, { useEffect, useRef, useState } from 'react';
import { readerCache } from '../services/readerCacheService';
import { useThemeStore } from '../../../core/theme/useThemeStore';

interface ThumbnailFilmstripProps {
  comicId: string;
  totalPages: number;
  currentPageIndex: number;
  isOpen: boolean;
  onSelectPage: (index: number) => void;
}

const ThumbnailCard: React.FC<{
  comicId: string;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}> = ({ comicId, index, isActive, onSelect }) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const { primaryColor } = useThemeStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;

    readerCache
      .getPageUrl(comicId, index)
      .then((url) => {
        if (!cancelled) setThumbUrl(url);
      })
      .catch(() => {
        // En caso de retraso en worker, mantener placeholder limpio
      });

    return () => {
      cancelled = true;
    };
  }, [comicId, index, isVisible]);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isActive]);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(index)}
      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer focus:outline-none transition-all py-1 group"
      aria-label={`Ir a página ${index + 1}`}
    >
      <div
        className={`relative w-16 sm:w-20 h-24 sm:h-28 flex items-center justify-center overflow-hidden bg-zinc-900 transition-all ${
          isActive
            ? 'opacity-100 ring-2'
            : 'opacity-60 hover:opacity-90'
        }`}
        style={isActive ? { borderColor: primaryColor.hex, outlineColor: primaryColor.hex } : undefined}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={`Miniatura ${index + 1}`}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
        ) : (
          <span className="text-xs font-mono text-zinc-500">
            {index + 1}
          </span>
        )}

        {/* Indicador lineal sutil de página activa */}
        {isActive && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 transition-colors"
            style={{ backgroundColor: primaryColor.hex }}
          />
        )}
      </div>

      <span
        className={`text-[10px] font-mono transition-colors ${
          isActive ? 'text-white font-semibold' : 'text-zinc-500 group-hover:text-zinc-300'
        }`}
      >
        {index + 1}
      </span>
    </button>
  );
};

export const ThumbnailFilmstrip: React.FC<ThumbnailFilmstripProps> = ({
  comicId,
  totalPages,
  currentPageIndex,
  isOpen,
  onSelectPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div
      className="w-full border-t border-zinc-800/80 bg-black/95 py-2.5 px-3 select-none pointer-events-auto transition-all"
      aria-label="Tira de miniaturas de páginas"
    >
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-2 px-1 max-w-4xl mx-auto">
        <span>Navegador de páginas</span>
        <span>
          Página {currentPageIndex + 1} de {totalPages}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex items-center gap-2.5 overflow-x-auto overflow-y-hidden overscroll-contain py-1 max-w-4xl mx-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <ThumbnailCard
            key={i}
            comicId={comicId}
            index={i}
            isActive={i === currentPageIndex}
            onSelect={onSelectPage}
          />
        ))}
      </div>
    </div>
  );
};
