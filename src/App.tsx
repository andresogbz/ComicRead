import { useState } from 'react';
import type { StoredComic } from './infrastructure/database/ComicDatabase';
import { LibraryGrid } from './features/library/components/LibraryGrid';
import { ReaderViewport } from './features/reader/components/ReaderViewport';
import { useLibraryStore } from './features/library/stores/useLibraryStore';
import { useThemeStore } from './core/theme/useThemeStore';

export function App() {
  const [activeComic, setActiveComic] = useState<StoredComic | null>(null);
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);
  const { primaryColor } = useThemeStore();

  const handleOpenComic = (comic: StoredComic) => {
    setActiveComic(comic);
  };

  const handleCloseReader = () => {
    setActiveComic(null);
    // Refrescar el progreso de lectura en la biblioteca
    loadLibrary();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Resplandor ambiental de fondo dinámico según el color primario seleccionado */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full blur-[130px] -z-10 transition-colors duration-500"
        style={{
          backgroundColor: primaryColor.glow,
        }}
      />

      {activeComic ? (
        <ReaderViewport
          comic={activeComic}
          onClose={handleCloseReader}
        />
      ) : (
        <main className="w-full">
          <LibraryGrid onOpenComic={handleOpenComic} />
        </main>
      )}
    </div>
  );
}

export default App;

