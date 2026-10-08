/**
 * Utilidades para transformar el HTML limpio de los capítulos
 * en texto plano apto para el motor de síntesis de voz (TTS).
 */

/** Longitud máxima de cada fragmento enviado al motor de voz. */
const MAX_CHUNK_LENGTH = 260;

const BLOCK_CLOSE_REGEX =
  /<\/(p|div|h[1-6]|li|blockquote|figcaption|pre|tr|section|article|header|footer|table|ul|ol)>/gi;

/**
 * Convierte el HTML de un capítulo en texto plano legible para el TTS.
 * Inserta saltos de línea en los cierres de bloques para que las
 * oraciones de párrafos distintos no se lean pegadas entre sí.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(BLOCK_CLOSE_REGEX, '\n');

  const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
  doc.querySelectorAll('script, style, noscript, svg').forEach((node) => node.remove());

  const raw = doc.body?.textContent || '';

  return raw
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .trim();
}

/**
 * Divide texto plano en fragmentos cortos y autónomos.
 * Respeta los límites de oración y de párrafo para que cada
 * fragmento suene natural al reproducirse.
 */
export function splitTextIntoChunks(text: string, maxLen: number = MAX_CHUNK_LENGTH): string[] {
  if (!text.trim()) return [];

  const chunks: string[] = [];

  for (const paragraph of text.split('\n')) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Divide en oraciones conservando los signos finales (., !, ?, …)
    const sentences = trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [trimmed];

    let current = '';

    for (const sentence of sentences) {
      const piece = sentence.trim();
      if (!piece) continue;

      if (piece.length > maxLen) {
        if (current) {
          chunks.push(current);
          current = '';
        }
        chunks.push(...splitLongText(piece, maxLen));
        continue;
      }

      if (current && current.length + piece.length + 1 > maxLen) {
        chunks.push(current);
        current = piece;
      } else {
        current = current ? `${current} ${piece}` : piece;
      }
    }

    if (current) chunks.push(current);
  }

  return chunks;
}

/** Parte un texto demasiado largo por límites de palabra. */
function splitLongText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const parts: string[] = [];
  let current = '';

  for (const word of words) {
    if (current && current.length + word.length + 1 > maxLen) {
      parts.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }

  if (current) parts.push(current);
  return parts;
}

export interface FormattedVoice {
  index: number;
  name: string;
  lang: string;
  label: string;
  isHighQuality: boolean;
  isDefault: boolean;
}

/**
 * Convierte un objeto de voz crudo del sistema o navegador en una etiqueta
 * limpia, legible y descriptiva, detectando variantes de alta definición (HD / Natural).
 */
export function formatVoiceLabel(
  voice: { name: string; lang: string; default?: boolean; localService?: boolean },
  index: number
): FormattedVoice {
  const name = voice.name || '';
  const lang = voice.lang || '';
  const isNetwork = !voice.localService || /network|neural|wavenet|hd|natural/i.test(name);

  const langCode = lang.toLowerCase().replace('_', '-');
  let country = '';
  if (langCode.includes('mx')) country = 'México';
  else if (langCode.includes('es-es') || langCode === 'es') country = 'España';
  else if (langCode.includes('us')) country = 'EE. UU.';
  else if (langCode.includes('co')) country = 'Colombia';
  else if (langCode.includes('ar')) country = 'Argentina';
  else if (langCode.includes('cl')) country = 'Chile';
  else if (langCode.startsWith('es')) country = 'Español';
  else if (langCode.startsWith('en')) country = 'Inglés';

  // Si es un identificador de Google TTS: ej: es-es-x-eed-network o es-mx-x-sfc-local
  const matchGoogle = name.match(/([a-z]{2}-[a-z]{2})-x-([a-z0-9]+)-(network|local)/i);
  if (matchGoogle) {
    const variantId = matchGoogle[2].toUpperCase();
    const tag = isNetwork ? ' (HD)' : '';
    return {
      index,
      name,
      lang,
      label: `${country || matchGoogle[1]} · Voz ${variantId}${tag}`,
      isHighQuality: isNetwork,
      isDefault: Boolean(voice.default),
    };
  }

  // Si el nombre es descriptivo de Microsoft / Web
  const cleanName = name
    .replace(/^Microsoft /i, '')
    .replace(/ Desktop/i, '')
    .replace(/ Online \(Natural\)/i, ' (HD)')
    .replace(/ \(Natural\)/i, ' (HD)')
    .trim();

  const finalLabel =
    isNetwork && !cleanName.includes('(HD)') ? `${cleanName} (HD)` : cleanName;

  return {
    index,
    name,
    lang,
    label: finalLabel || `Voz ${index + 1}`,
    isHighQuality: isNetwork,
    isDefault: Boolean(voice.default),
  };
}

/**
 * Filtra y ordena las voces del sistema priorizando el idioma objetivo (por defecto español)
 * y colocando las voces HD / Naturales al principio.
 */
export function sortAndFilterVoices(
  voices: { name: string; lang: string; default?: boolean; localService?: boolean }[],
  targetLangPrefix: string = 'es'
): FormattedVoice[] {
  const formatted = voices.map((v, i) => formatVoiceLabel(v, i));

  // Filtrar voces que coinciden con el idioma objetivo
  const matching = formatted.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith(targetLangPrefix.toLowerCase())
  );

  const listToOrder = matching.length > 0 ? matching : formatted;

  return [...listToOrder].sort((a, b) => {
    // 1. Las voces HD / Naturales primero
    if (a.isHighQuality !== b.isHighQuality) {
      return a.isHighQuality ? -1 : 1;
    }
    // 2. La voz predeterminada del sistema
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    // 3. Orden alfabético por etiqueta
    return a.label.localeCompare(b.label);
  });
}

