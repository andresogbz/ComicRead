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
