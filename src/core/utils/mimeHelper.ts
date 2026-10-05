const VALID_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
  'gif',
  'bmp',
  'svg',
]);

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

/**
 * Determina si una ruta de archivo corresponde a un archivo de imagen compatible.
 * Ignora archivos ocultos, de sistema operativo (__MACOSX, Thumbs.db) y directorios.
 */
export function isSupportedImageFile(path: string): boolean {
  // Ignorar directorios de sistema y archivos basura
  if (
    path.startsWith('__MACOSX') ||
    path.includes('/__MACOSX/') ||
    path.endsWith('/') ||
    path.endsWith('\\') ||
    path.endsWith('.DS_Store') ||
    path.toLowerCase().endsWith('thumbs.db')
  ) {
    return false;
  }

  const extension = path.split('.').pop()?.toLowerCase();
  return extension ? VALID_IMAGE_EXTENSIONS.has(extension) : false;
}

/**
 * Obtiene el tipo MIME a partir de la extensión del nombre de archivo.
 */
export function getMimeTypeFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_MAP[extension] || 'image/jpeg';
}
