import { useState } from 'react';
import type { StoredComic } from './infrastructure/database/ComicDatabase';
import { LibraryGrid } from './features/library/components/LibraryGrid';
import { ReaderViewport } from './features/reader/components/ReaderViewport';
import { useLibraryStore } from './features/library/stores/useLibraryStore';

export function App() {
  const [activeComic, setActiveComic] = useState<StoredComic | null>(null);
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);

  const handleOpenComic = (comic: StoredComic) => {
    setActiveComic(comic);
  };

  const handleCloseReader = () => {
    setActiveComic(null);
    // Refrescar el progreso de lectura en la biblioteca
    loadLibrary();
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Resplandor ambiental de fondo estilo YouTube / Apple */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px] -z-10" />

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
