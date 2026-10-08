import { useCallback, useEffect, useRef, useState } from 'react';
import { speechService } from '../services/speechService';
import {
  htmlToPlainText,
  splitTextIntoChunks,
  sortAndFilterVoices,
} from '../utils/speechText';
import type { SpeechStatus, SpeechVoiceOption } from '../types/book';

type ChunkOutcome = 'completed' | 'aborted' | 'error';

const RATE_STORAGE_KEY = 'comicread_book_speech_rate';
const PITCH_STORAGE_KEY = 'comicread_book_speech_pitch';
const VOICE_NAME_STORAGE_KEY = 'comicread_book_speech_voice_name';
const DEFAULT_RATE = 1;
const DEFAULT_PITCH = 1;

function loadStoredRate(): number {
  try {
    const raw =
      localStorage.getItem(RATE_STORAGE_KEY) ||
      localStorage.getItem('gomic_book_speech_rate');
    const value = raw ? Number(raw) : NaN;
    if (Number.isFinite(value) && value >= 0.5 && value <= 3) return value;
  } catch {
    // Ignorar
  }
  return DEFAULT_RATE;
}

function loadStoredPitch(): number {
  try {
    const raw = localStorage.getItem(PITCH_STORAGE_KEY);
    const value = raw ? Number(raw) : NaN;
    if (Number.isFinite(value) && value >= 0.5 && value <= 2) return value;
  } catch {
    // Ignorar
  }
  return DEFAULT_PITCH;
}

/**
 * Controlador de lectura en voz alta (TTS) para el lector de libros.
 *
 * Permite seleccionar voces de alta calidad (HD/Natural), modular el tono,
 * velocidad, probar voces en tiempo real y avanzar automáticamente entre capítulos.
 */
export function useSpeechReader() {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported] = useState(() => speechService.isSupported());
  const [rate, setRateState] = useState<number>(() => loadStoredRate());
  const [pitch, setPitchState] = useState<number>(() => loadStoredPitch());
  const [availableVoices, setAvailableVoices] = useState<SpeechVoiceOption[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndexState] = useState<number | null>(null);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Sesión actual: al incrementarse, los bucles de reproducción en curso se detienen.
  const sessionRef = useRef(0);
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const onFinishedRef = useRef<(() => void) | null>(null);
  const finishCurrentRef = useRef<((outcome: ChunkOutcome) => void) | null>(null);

  const rateRef = useRef(rate);
  const pitchRef = useRef(pitch);
  const voiceIndexRef = useRef<number | null>(selectedVoiceIndex);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  useEffect(() => {
    voiceIndexRef.current = selectedVoiceIndex;
  }, [selectedVoiceIndex]);

  // Resuelve la carrera entre "terminó de hablar" y "se pidió detener"
  const abortCurrentChunk = useCallback(() => {
    finishCurrentRef.current?.('aborted');
    finishCurrentRef.current = null;
    return speechService.stop();
  }, []);

  // Carga inicial y auto-selección de voces HD
  useEffect(() => {
    let isCancelled = false;

    const loadVoices = async () => {
      if (!speechService.isSupported()) return;

      const raw = await speechService.getSupportedVoices();
      if (isCancelled || raw.length === 0) return;

      const processed = sortAndFilterVoices(raw);
      setAvailableVoices(processed);

      // Revisar si ya había una voz guardada por nombre
      let savedVoiceName: string | null = null;
      try {
        savedVoiceName = localStorage.getItem(VOICE_NAME_STORAGE_KEY);
      } catch {
        // Ignorar
      }

      let chosenIndex: number | null = null;

      if (savedVoiceName) {
        const found = processed.find((v) => v.name === savedVoiceName);
        if (found) {
          chosenIndex = found.index;
        }
      }

      // Si no hay voz elegida previamente, priorizar la primera HD o la por defecto
      if (chosenIndex === null && processed.length > 0) {
        const bestVoice =
          processed.find((v) => v.isHighQuality) ||
          processed.find((v) => v.isDefault) ||
          processed[0];

        if (bestVoice) {
          chosenIndex = bestVoice.index;
          try {
            localStorage.setItem(VOICE_NAME_STORAGE_KEY, bestVoice.name);
          } catch {
            // Ignorar
          }
        }
      }

      if (chosenIndex !== null) {
        setSelectedVoiceIndexState(chosenIndex);
        voiceIndexRef.current = chosenIndex;
      }
    };

    void loadVoices();

    // En navegador web, window.speechSynthesis puede tardar en poblar voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        void loadVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        isCancelled = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }

    return () => {
      isCancelled = true;
    };
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
            .speakChunk(
              chunks[i],
              rateRef.current,
              pitchRef.current,
              voiceIndexRef.current
            )
            .then(() => finish('completed'))
            .catch((err) => {
              console.warn('[useSpeechReader] El motor de voz falló:', err);
              finish('error');
            });
        });
        finishCurrentRef.current = null;

        if (outcome === 'error') {
          if (sessionRef.current !== session) return;
          setErrorMessage('No se pudo continuar con la lectura en voz alta.');
          setStatus('idle');
          setProgress(0);
          onFinishedRef.current = null;
          return;
        }

        if (outcome === 'aborted' || sessionRef.current !== session) return;
      }

      if (sessionRef.current !== session) return;

      // Capítulo completado: notificar para avanzar al siguiente
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

  const setPitch = useCallback((value: number) => {
    pitchRef.current = value;
    setPitchState(value);
    try {
      localStorage.setItem(PITCH_STORAGE_KEY, String(value));
    } catch {
      // Ignorar
    }
  }, []);

  const setVoiceIndex = useCallback(
    (idx: number | null) => {
      voiceIndexRef.current = idx;
      setSelectedVoiceIndexState(idx);
      if (idx !== null) {
        const found = availableVoices.find((v) => v.index === idx);
        if (found) {
          try {
            localStorage.setItem(VOICE_NAME_STORAGE_KEY, found.name);
          } catch {
            // Ignorar
          }
        }
      } else {
        try {
          localStorage.removeItem(VOICE_NAME_STORAGE_KEY);
        } catch {
          // Ignorar
        }
      }
    },
    [availableVoices]
  );

  /** Prueba rápida de voz con una frase de muestra */
  const testVoice = useCallback(
    async (voiceIndexToTest?: number) => {
      const idx = voiceIndexToTest ?? voiceIndexRef.current;
      sessionRef.current += 1;
      await abortCurrentChunk();
      setIsTestingVoice(true);

      const sampleText =
        'Esta es una prueba de voz para la lectura de tus libros en ComicRead.';
      try {
        await speechService.speakChunk(
          sampleText,
          rateRef.current,
          pitchRef.current,
          idx
        );
      } catch (err) {
        console.warn('[useSpeechReader] Prueba de voz falló:', err);
      } finally {
        setIsTestingVoice(false);
      }
    },
    [abortCurrentChunk]
  );

  const stopTest = useCallback(() => {
    setIsTestingVoice(false);
    void abortCurrentChunk();
  }, [abortCurrentChunk]);

  const openInstall = useCallback(async () => {
    await speechService.openInstall();
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
    pitch,
    selectedVoiceIndex,
    availableVoices,
    isVoiceSettingsOpen,
    isTestingVoice,
    isSupported,
    errorMessage,
    start,
    pause,
    resume,
    stop,
    setRate,
    setPitch,
    setVoiceIndex,
    setIsVoiceSettingsOpen,
    testVoice,
    stopTest,
    openInstall,
  };
}
