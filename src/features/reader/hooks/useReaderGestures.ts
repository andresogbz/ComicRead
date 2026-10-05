import { useRef } from 'react';
import { useGesture } from '@use-gesture/react';

interface UseReaderGesturesProps {
  zoom: number;
  pan: { x: number; y: number };
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDoubleTap: () => void;
}

export function useReaderGestures({
  zoom,
  pan,
  setZoom,
  setPan,
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
}: UseReaderGesturesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGesture(
    {
      // Manejo de Drag / Pan y Swipe
      onDrag: ({ movement: [mx, my], swipe: [swipeX], first, last, memo = { startPan: { ...pan } } }) => {
        if (first) {
          memo.startPan = { ...pan };
        }

        if (zoom > 1) {
          // Si hay zoom activo, arrastrar desplaza la imagen en el viewport
          setPan({
            x: memo.startPan.x + mx,
            y: memo.startPan.y + my,
          });
        } else if (last) {
          // Si está a escala normal (1x), detectar swipe para pasar de página
          if (swipeX === -1 || mx < -60) {
            onSwipeLeft();
          } else if (swipeX === 1 || mx > 60) {
            onSwipeRight();
          }
        }

        return memo;
      },

      // Manejo de Pinch-to-zoom táctil con 2 dedos
      onPinch: ({ offset: [scale] }) => {
        const clampedScale = Math.max(1, Math.min(scale, 4));
        setZoom(clampedScale);
        if (clampedScale === 1) {
          setPan({ x: 0, y: 0 });
        }
      },

      // Doble toque para alternar zoom rápido
      onDoubleClick: () => {
        onDoubleTap();
      },
    },
    {
      target: containerRef,
      drag: {
        filterTaps: true,
        threshold: 10,
      },
      pinch: {
        scaleBounds: { min: 1, max: 4 },
      },
    }
  );

  return {
    containerRef,
  };
}
