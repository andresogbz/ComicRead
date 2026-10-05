import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { readerCache } from '../services/readerCacheService';

interface WebtoonViewProps {
  comicId: string;
  totalPages: number;
  initialPageIndex: number;
  onPageChange: (index: number) => void;
  onToggleHud: () => void;
}

interface WebtoonPageItemProps {
  comicId: string;
  pageIndex: number;
  onVisible: (index: number) => void;
}

const WebtoonPageItem: React.FC<WebtoonPageItemProps> = ({
  comicId,
  pageIndex,
  onVisible,
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

          // Cargar URL si aún no está cargada
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
        rootMargin: '600px 0px 600px 0px', // Precargar páginas cercanas al viewport
        threshold: 0.1,
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
      className="relative min-h-[500px] w-full max-w-3xl mx-auto flex items-center justify-center bg-black"
    >
      {url ? (
        <img
          src={url}
          alt={`Página ${pageIndex + 1}`}
          loading="lazy"
          className="w-full h-auto block select-none"
          draggable={false}
        />
      ) : isLoading ? (
        <div className="flex h-96 w-full items-center justify-center bg-zinc-950/60">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500/50" />
        </div>
      ) : null}
    </div>
  );
};

export const WebtoonView: React.FC<WebtoonViewProps> = ({
  comicId,
  totalPages,
  initialPageIndex,
  onPageChange,
  onToggleHud,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Desplazar a la página guardada en la primera carga si no es 0
  useEffect(() => {
    if (initialPageIndex > 0 && containerRef.current) {
      const pageElements = containerRef.current.children;
      if (pageElements[initialPageIndex]) {
        pageElements[initialPageIndex].scrollIntoView();
      }
    }
  }, [initialPageIndex]);

  return (
    <div
      ref={containerRef}
      onClick={onToggleHud}
      className="h-screen w-screen overflow-y-auto overflow-x-hidden bg-black select-none"
    >
      {Array.from({ length: totalPages }).map((_, index) => (
        <WebtoonPageItem
          key={index}
          comicId={comicId}
          pageIndex={index}
          onVisible={onPageChange}
        />
      ))}
    </div>
  );
};
