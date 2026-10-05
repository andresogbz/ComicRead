/**
 * Comparador para ordenamiento alfanumérico natural (ej. 1, 2, 10 en lugar de 1, 10, 2).
 */
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function naturalSort(a: string, b: string): number {
  return collator.compare(a, b);
}

/**
 * Ordena un array de rutas de archivo de forma natural extrayendo solo el nombre del archivo.
 */
export function naturalSortFilePaths(filePaths: string[]): string[] {
  return [...filePaths].sort((a, b) => {
    const nameA = a.split('/').pop() || a;
    const nameB = b.split('/').pop() || b;
    return collator.compare(nameA, nameB);
  });
}
