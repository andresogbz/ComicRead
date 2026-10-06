import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { readerCache } from '../services/readerCacheService';

interface WebtoonViewProps {
  comicId: string;
  totalPages: number;
  initialPageIndex: number;
  isHudVisible?: boolean;
  onPageChange: (index: number) => void;
  onToggleHud: () => void;
  isSnapMode?: boolean;
}

interface WebtoonPageItemProps {
  comicId: string;
  pageIndex: number;
  onVisible: (index: number) => void;
  isSnapMode: boolean;
}

const WebtoonPageItem: React.FC<WebtoonPageItemProps> = ({
  comicId,
  pageIndex,
  onVisible,
  isSnapMode,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onVisible(pageIndex);

          // Cargar URL de la página si aún no se ha obtenido
          if (!url) {
            readerCache
              .getPageUrl(comicId, pageIndex)
              .then((pageUrl) => {
                if (!isCancelled) {
                  setUrl(pageUrl);
                  setIsLoading(false);
                }
              })
              .catch(() => {
                if (!isCancelled) setIsLoading(false);
              });
          }
        }
      },
      {
        rootMargin: '400px 0px 400px 0px',
        threshold: 0.25,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isCancelled = true;
      observer.disconnect();
    };
  }, [comicId, pageIndex, url, onVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center justify-center bg-black ${
        isSnapMode
          ? 'h-screen snap-start snap-always'
          : 'min-h-[600px]'
      }`}
    >
      {url ? (
        <img
          src={url}
          alt={`Página ${pageIndex + 1}`}
          loading="lazy"
          className={
            isSnapMode
              ? 'max-h-screen w-auto max-w-full object-contain block select-none pointer-events-none'
              : 'w-full h-auto max-w-3xl block select-none pointer-events-none'
          }
          draggable={false}
        />
      ) : isLoading ? (
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400/60" />
        </div>
      ) : null}
    </div>
  );
};

export const WebtoonView: React.FC<WebtoonViewProps> = ({
  comicId,
  totalPages,
  initialPageIndex,
  isHudVisible = false,
  onPageChange,
  onToggleHud,
  isSnapMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledIndexRef = useRef<number>(-1);

  // Desplazar a la página correspondiente cuando cambia el índice
  useEffect(() => {
    if (
      containerRef.current &&
      lastScrolledIndexRef.current !== initialPageIndex &&
      containerRef.current.children[initialPageIndex]
    ) {
      lastScrolledIndexRef.current = initialPageIndex;
      const target = containerRef.current.children[initialPageIndex] as HTMLElement;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialPageIndex]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Si el HUD está visible, cerrarlo inmediatamente con cualquier toque
    if (isHudVisible) {
      onToggleHud();
      return;
    }

    const clientY = e.clientY;
    const height = window.innerHeight;

    if (clientY < height * 0.3) {
      // Zona superior (30%): desplazar hacia arriba
      if (containerRef.current) {
        containerRef.current.scrollBy({
          top: -height * 0.75,
          behavior: 'smooth',
        });
      }
    } else if (clientY > height * 0.7) {
      // Zona inferior (30%): desplazar hacia abajo
      if (containerRef.current) {
        containerRef.current.scrollBy({
          top: height * 0.75,
          behavior: 'smooth',
        });
      }
    } else {
      // Zona central (40%): abrir menú HUD
      onToggleHud();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`h-screen w-screen overflow-y-auto overflow-x-hidden bg-black select-none ${
        isSnapMode ? 'snap-y snap-mandatory scroll-smooth overscroll-contain' : ''
      }`}
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {Array.from({ length: totalPages }).map((_, index) => (
        <WebtoonPageItem
          key={index}
          comicId={comicId}
          pageIndex={index}
          onVisible={onPageChange}
          isSnapMode={isSnapMode}
        />
      ))}
    </div>
  );
};
