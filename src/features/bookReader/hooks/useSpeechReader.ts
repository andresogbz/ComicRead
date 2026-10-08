import { useCallback, useEffect, useRef, useState } from 'react';
import { speechService } from '../services/speechService';
import { htmlToPlainText, splitTextIntoChunks } from '../utils/speechText';
import type { SpeechStatus } from '../types/book';

type ChunkOutcome = 'completed' | 'aborted' | 'error';

const RATE_STORAGE_KEY = 'gomic_book_speech_rate';
const DEFAULT_RATE = 1;

function loadStoredRate(): number {
  try {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    const value = raw ? Number(raw) : NaN;
    if (Number.isFinite(value) && value >= 0.5 && value <= 3) return value;
  } catch {
    // Ignorar
  }
  return DEFAULT_RATE;
}

/**
 * Controlador de lectura en voz alta (TTS) para el lector de libros.
 *
 * Reproduce el texto de un capítulo fragmento a fragmento, permite
 * pausar/reanudar, notifica al terminar cada capítulo (para avanzar
 * automáticamente) y se detiene al desmontar el lector.
 */
export function useSpeechReader() {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported] = useState(() => speechService.isSupported());
  const [rate, setRateState] = useState<number>(() => loadStoredRate());

  // Sesión actual: al incrementarse, los bucles de reproducción en curso se detienen.
  const sessionRef = useRef(0);
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const onFinishedRef = useRef<(() => void) | null>(null);
  const finishCurrentRef = useRef<((outcome: ChunkOutcome) => void) | null>(null);
  const rateRef = useRef(rate);

  // Resuelve la carrera entre "terminó de hablar" y "se pidió detener":
  // en Android, llamar a stop() deja la promesa pendiente sin resolver.
  const abortCurrentChunk = useCallback(() => {
    finishCurrentRef.current?.('aborted');
    finishCurrentRef.current = null;
    return speechService.stop();
  }, []);

  const runLoop = useCallback(
    async (session: number, fromIndex: number) => {
      const chunks = chunksRef.current;

      for (let i = fromIndex; i < chunks.length; i += 1) {
        if (sessionRef.current !== session) return;

        chunkIndexRef.current = i;
        setProgress(chunks.length > 0 ? (i + 1) / chunks.length : 0);

        const outcome = await new Promise<ChunkOutcome>((resolve) => {
          let settled = false;
          const finish = (value: ChunkOutcome) => {
            if (settled) return;
            settled = true;
            resolve(value);
          };
          finishCurrentRef.current = finish;
          speechService
            .speakChunk(chunks[i], rateRef.current)
            .then(() => finish('completed'))
            .catch((err) => {
              console.warn('[useSpeechReader] El motor de voz falló:', err);
              finish('error');
            });
        });
        finishCurrentRef.current = null;

        if (outcome === 'error') {
          if (sessionRef.current !== session) return;
          setErrorMessage('No se pudo iniciar la lectura en voz alta.');
          setStatus('idle');
          setProgress(0);
          onFinishedRef.current = null;
          return;
        }

        if (outcome === 'aborted' || sessionRef.current !== session) return;
      }

      if (sessionRef.current !== session) return;

      // Capítulo completado: notificar para avanzar al siguiente
      // (o detener, si no hay callback de continuación).
      const finished = onFinishedRef.current;
      onFinishedRef.current = null;
      setProgress(0);
      if (finished) {
        finished();
      } else {
        setStatus('idle');
      }
    },
    []
  );

  /** Inicia la lectura del HTML de un capítulo. */
  const start = useCallback(
    async (html: string, onFinished?: () => void) => {
      const chunks = splitTextIntoChunks(htmlToPlainText(html));
      if (chunks.length === 0) {
        setErrorMessage('Este capítulo no tiene texto para leer.');
        setStatus('idle');
        return;
      }

      sessionRef.current += 1;
      const session = sessionRef.current;
      await abortCurrentChunk();
      if (sessionRef.current !== session) return;

      chunksRef.current = chunks;
      chunkIndexRef.current = 0;
      onFinishedRef.current = onFinished ?? null;
      setErrorMessage(null);
      setProgress(0);
      setStatus('playing');
      void runLoop(session, 0);
    },
    [abortCurrentChunk, runLoop]
  );

  /** Pausa manteniendo la posición del fragmento actual. */
  const pause = useCallback(async () => {
    if (chunksRef.current.length === 0) return;
    sessionRef.current += 1;
    setStatus('paused');
    await abortCurrentChunk();
  }, [abortCurrentChunk]);

  /** Reanuda desde el último fragmento reproducido. */
  const resume = useCallback(() => {
    if (chunksRef.current.length === 0) return;
    sessionRef.current += 1;
    const session = sessionRef.current;
    setStatus('playing');
    setErrorMessage(null);
    void runLoop(session, chunkIndexRef.current);
  }, [runLoop]);

  /** Detiene la reproducción y limpia el estado. */
  const stop = useCallback(async () => {
    sessionRef.current += 1;
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    onFinishedRef.current = null;
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    await abortCurrentChunk();
  }, [abortCurrentChunk]);

  const setRate = useCallback((value: number) => {
    rateRef.current = value;
    setRateState(value);
    try {
      localStorage.setItem(RATE_STORAGE_KEY, String(value));
    } catch {
      // Ignorar
    }
  }, []);

  // Liberar el motor de voz al desmontar el lector.
  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      finishCurrentRef.current?.('aborted');
      finishCurrentRef.current = null;
      void speechService.stop();
    };
  }, []);

  return {
    status,
    progress,
    rate,
    isSupported,
    errorMessage,
    start,
    pause,
    resume,
    stop,
    setRate,
  };
}
