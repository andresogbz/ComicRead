import React from 'react';
import { X, Play, Square, ExternalLink, Check, Volume2 } from 'lucide-react';
import {
  type BookReaderSpeech,
  SPEECH_RATES,
  SPEECH_PITCHES,
} from '../types/book';

interface BookSpeechSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speech: BookReaderSpeech;
}

export const BookSpeechSettingsModal: React.FC<BookSpeechSettingsModalProps> = ({
  isOpen,
  onClose,
  speech,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-950 text-zinc-100 flex flex-col border-t sm:border-b border-zinc-800 pb-6 sm:pb-4 max-h-[85vh] overflow-hidden">
        {/* Encabezado plano */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-zinc-300" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 m-0">
              Ajustes de voz
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Cerrar ajustes de voz"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex flex-col gap-6 px-5 py-4 overflow-y-auto">
          {/* 1. Selector de Voz */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400">
                Voz del sistema
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {speech.availableVoices.length > 0
                  ? `${speech.availableVoices.length} disponibles`
                  : 'Detectando...'}
              </span>
            </div>

            {speech.availableVoices.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500">
                Cargando voces disponibles en el dispositivo...
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-900 border-y border-zinc-900 max-h-48 overflow-y-auto">
                {speech.availableVoices.map((voice) => {
                  const isSelected = speech.selectedVoiceIndex === voice.index;

                  return (
                    <div
                      key={`${voice.name}-${voice.index}`}
                      className={`flex items-center justify-between py-2 px-1 transition-colors cursor-pointer ${
                        isSelected ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      onClick={() => speech.setVoiceIndex(voice.index)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-3.5 flex justify-center shrink-0">
                          {isSelected && <Check className="h-3.5 w-3.5 text-zinc-200" />}
                        </div>
                        <span className="text-xs truncate font-medium">
                          {voice.label}
                        </span>
                        {voice.isHighQuality && (
                          <span className="text-[9px] font-mono px-1 py-0.2 text-zinc-400 border border-zinc-800 shrink-0">
                            HD
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (speech.isTestingVoice) {
                            speech.stopTest();
                          } else {
                            void speech.testVoice(voice.index);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                        title="Probar esta voz"
                        aria-label={`Probar voz ${voice.label}`}
                      >
                        {speech.isTestingVoice ? (
                          <Square className="h-3 w-3 fill-current" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Tono de la voz (Pitch) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400">
                Tono de voz (Pitch)
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {speech.pitch.toFixed(2)}x
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SPEECH_PITCHES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => speech.setPitch(item.value)}
                  className={`py-1.5 px-2 text-xs transition-colors cursor-pointer text-center ${
                    speech.pitch === item.value
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 border border-zinc-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Velocidad de lectura */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400">
                Velocidad de reproducción
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {speech.rate}x
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {SPEECH_RATES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => speech.setRate(value)}
                  className={`py-1.5 px-2 font-mono text-xs transition-colors cursor-pointer text-center ${
                    speech.rate === value
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 border border-zinc-900'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>

          {/* 4. Botón de prueba rápida */}
          <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                if (speech.isTestingVoice) {
                  speech.stopTest();
                } else {
                  void speech.testVoice();
                }
              }}
              className="flex items-center gap-2 py-1.5 px-3 text-xs text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              {speech.isTestingVoice ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  <span>Detener muestra</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Probar muestra de voz</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                speech.setPitch(1.0);
                speech.setRate(1.0);
              }}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Restablecer valores
            </button>
          </div>

          {/* 5. Nota informativa sobre voces HD de Android */}
          <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2 text-[11px] text-zinc-400 leading-relaxed">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-300">
                Para obtener voces más naturales:
              </span>
              <button
                type="button"
                onClick={() => void speech.openInstall()}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Abrir instalador de voces en Android"
              >
                <span>Ajustes de voz Android</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
            <p className="m-0 text-zinc-500">
              En Ajustes de tu teléfono o tablet ve a Accesibilidad &gt; Salida de texto a voz &gt; Servicios de voz de Google &gt; Instalar datos de voz para descargar paquetes en alta definición.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
