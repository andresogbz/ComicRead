import type { StoredComic } from '../../../infrastructure/database/ComicDatabase';

/**
 * Extrae el número de capítulo, tomo o entrega de un título o nombre de archivo.
 * Ejemplo: "Batman - Año Uno #02.cbz" -> { prefix: "batman - año uno", number: 2 }
 */
export function extractChapterInfo(text: string): { prefix: string; number: number | null } {
  // Limpiar extensiones comunes
  const clean = text.replace(/\.(cbz|cbr|zip|rar|tar)$/i, '').trim();

  // Buscar patrones comunes como #01, vol 2, ch.3, cap 4, tomo 5, o simplemente un número al final
  const match = clean.match(/(.*?)(?:[#\-_ ]+|vol\.?|ch\.?|cap\.?|tomo[ ]*)(\d+)(?:\s*|\D*)$/i);

  if (match) {
    const rawPrefix = match[1].trim().toLowerCase();
    const num = parseInt(match[2], 10);
    return {
      prefix: rawPrefix.replace(/[-_#]+$/, '').trim(),
      number: isNaN(num) ? null : num,
    };
  }

  // Si no hay separador explícito, intentar buscar cualquier número
  const numMatch = clean.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return {
      prefix: clean.replace(/\d+/g, '').trim().toLowerCase(),
      number: isNaN(num) ? null : num,
    };
  }

  return { prefix: clean.toLowerCase(), number: null };
}

/**
 * Encuentra de forma inteligente el cómic siguiente para continuar la lectura automáticamente.
 */
export function findNextComic(
  currentComic: StoredComic,
  allComics: StoredComic[]
): StoredComic | null {
  if (!allComics || allComics.length <= 1) return null;

  const currentInfo = extractChapterInfo(currentComic.title || currentComic.fileName);

  // 1. Si ambos tienen la misma colección asignada
  if (currentComic.collection) {
    const sameCollectionComics = allComics.filter(
      (c) => c.id !== currentComic.id && c.collection === currentComic.collection
    );

    if (sameCollectionComics.length > 0) {
      if (currentInfo.number !== null) {
        const nextNum = currentInfo.number + 1;
        const found = sameCollectionComics.find((c) => {
          const info = extractChapterInfo(c.title || c.fileName);
          return info.number === nextNum;
        });
        if (found) return found;
      }

      // Ordenar alfabéticamente por título dentro de la misma colección
      const sorted = [...allComics.filter((c) => c.collection === currentComic.collection)].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
      );
      const currentIndex = sorted.findIndex((c) => c.id === currentComic.id);
      if (currentIndex !== -1 && currentIndex + 1 < sorted.length) {
        return sorted[currentIndex + 1];
      }
    }
  }

  // 2. Si no tienen colección explícita, buscar por prefijo de título y número secuencial
  if (currentInfo.number !== null) {
    const targetNumber = currentInfo.number + 1;

    for (const comic of allComics) {
      if (comic.id === currentComic.id) continue;
      const otherInfo = extractChapterInfo(comic.title || comic.fileName);

      if (otherInfo.number === targetNumber) {
        // Verificar si los prefijos son compatibles
        if (
          !currentInfo.prefix ||
          !otherInfo.prefix ||
          otherInfo.prefix.includes(currentInfo.prefix) ||
          currentInfo.prefix.includes(otherInfo.prefix)
        ) {
          return comic;
        }
      }
    }
  }

  return null;
}
