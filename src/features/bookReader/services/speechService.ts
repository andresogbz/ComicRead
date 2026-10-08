import { Capacitor } from '@capacitor/core';
import { TextToSpeech, QueueStrategy } from '@capacitor-community/text-to-speech';

const ENGINE_RETRY_DELAY_MS = 700;

/**
 * Fachada de síntesis de voz (TTS).
 *
 * En la app Android se usa el plugin nativo @capacitor-community/text-to-speech
 * (el WebView de Android NO implementa window.speechSynthesis). En el navegador
 * de desarrollo el propio plugin delega en la Web Speech API.
 */
class SpeechService {
  private cachedLang: string | null = null;

  /** La plataforma dispone de algún motor de voz utilizable. */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform() || 'speechSynthesis' in window;
  }

  /**
   * Habla un fragmento de texto y resuelve cuando termina de reproducirse.
   * Rechaza si el motor falla (para que el hook detenga la reproducción).
   */
  async speakChunk(text: string, rate: number): Promise<void> {
    const lang = await this.resolveLanguage();

    try {
      await this.speak(text, lang, rate);
    } catch (err) {
      if (this.isEngineInitError(err)) {
        // El motor nativo aún se está inicializando: reintentar una vez.
        await delay(ENGINE_RETRY_DELAY_MS);
        await this.speak(text, lang, rate);
        return;
      }

      if (this.isUnsupportedLanguageError(err) && this.cachedLang !== null) {
        // El idioma cacheado dejó de estar disponible: resolver de nuevo y reintentar.
        this.cachedLang = null;
        const retryLang = await this.resolveLanguage();
        await this.speak(text, retryLang, rate);
        return;
      }

      throw err;
    }
  }

  /** Detiene cualquier reproducción en curso de forma segura. */
  async stop(): Promise<void> {
    if (!this.isSupported()) return;
    try {
      await TextToSpeech.stop();
    } catch {
      // El motor aún no está listo o no hay motor: nada que detener.
    }
  }

  private speak(text: string, lang: string, rate: number): Promise<void> {
    return TextToSpeech.speak({
      text,
      lang,
      rate,
      volume: 1,
      queueStrategy: QueueStrategy.Flush,
    });
  }

  /**
   * Elige el idioma de voz: idioma del dispositivo con cascada de
   * respaldo (español e inglés). En nativo se valida con el sistema.
   */
  private async resolveLanguage(): Promise<string> {
    if (this.cachedLang) return this.cachedLang;

    const candidates = this.languageCandidates();

    if (!Capacitor.isNativePlatform()) {
      this.cachedLang = candidates[0];
      return this.cachedLang;
    }

    for (const lang of candidates) {
      try {
        const { supported } = await TextToSpeech.isLanguageSupported({ lang });
        if (supported) {
          this.cachedLang = lang;
          return lang;
        }
      } catch {
        // Motor aún inicializando: probar con el siguiente candidato.
      }
    }

    this.cachedLang = candidates[0];
    return this.cachedLang;
  }

  private languageCandidates(): string[] {
    const navLang =
      typeof navigator !== 'undefined' && navigator.language ? navigator.language : '';
    const list = [navLang, 'es-419', 'es-ES', 'es', 'en-US', 'en'];
    return Array.from(new Set(list.filter(Boolean)));
  }

  private isEngineInitError(err: unknown): boolean {
    return /not yet initialized|not available on this device/i.test(errorMessage(err));
  }

  private isUnsupportedLanguageError(err: unknown): boolean {
    return /language is not supported/i.test(errorMessage(err));
  }
}

function errorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message ?? '');
  }
  return String(err ?? '');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const speechService = new SpeechService();
