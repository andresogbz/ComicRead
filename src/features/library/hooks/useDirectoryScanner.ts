import { useState, useCallback } from 'react';

const SUPPORTED_EXTENSIONS = ['.cbz', '.cbr', '.zip', '.rar', '.epub', '.txt', '.pdf'];

function isSupportedMediaFile(name: string): boolean {
  const lower = name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function useDirectoryScanner(onFilesFound: (files: File[]) => void) {
  const [isScanning, setIsScanning] = useState(false);

  /**
   * Escanea recursivamente un DirectoryHandle de la File System Access API.
   */
  const scanDirectoryHandle = useCallback(
    async (dirHandle: any, collectedFiles: File[]) => {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          if (isSupportedMediaFile(entry.name)) {
            const file = await entry.getFile();
            collectedFiles.push(file);
          }
        } else if (entry.kind === 'directory') {
          // Evitar carpetas ocultas del sistema
          if (!entry.name.startsWith('.')) {
            await scanDirectoryHandle(entry, collectedFiles);
          }
        }
      }
    },
    []
  );

  /**
   * Fallback con elemento input HTML estándar
   */
  const triggerInputDirectoryScan = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    (input as any).webkitdirectory = true;
    (input as any).directory = true;
    input.multiple = true;

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files).filter((f) => isSupportedMediaFile(f.name));
        if (files.length > 0) {
          onFilesFound(files);
        }
      }
    };

    input.click();
  }, [onFilesFound]);

  /**
   * Abre el diálogo de selección de directorio del sistema operativo.
   */
  const scanDirectory = useCallback(async () => {
    try {
      setIsScanning(true);

      // Usar File System Access API si está disponible en el navegador
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        const collected: File[] = [];
        await scanDirectoryHandle(dirHandle, collected);
        if (collected.length > 0) {
          onFilesFound(collected);
        }
      } else {
        // Fallback para navegadores sin showDirectoryPicker
        triggerInputDirectoryScan();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error al escanear directorio:', err);
      }
    } finally {
      setIsScanning(false);
    }
  }, [scanDirectoryHandle, onFilesFound, triggerInputDirectoryScan]);

  /**
   * Selector directo para cómics y libros (.cbz, .cbr, .epub, .txt).
   */
  const pickFiles = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.cbz,.cbr,.zip,.rar,.epub,.txt,.pdf';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files).filter((f) => isSupportedMediaFile(f.name));
        if (files.length > 0) {
          onFilesFound(files);
        }
      }
    };

    input.click();
  }, [onFilesFound]);

  return {
    isScanning,
    scanDirectory,
    pickFiles,
  };
}
