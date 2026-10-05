import { useState } from 'react';
import type { StoredComic } from './infrastructure/database/ComicDatabase';
import { AppNavigation, type AppTab } from './shared/components/AppNavigation';
import { HomeDashboard } from './features/home/components/HomeDashboard';
import { LibraryGrid } from './features/library/components/LibraryGrid';
import { ReaderViewport } from './features/reader/components/ReaderViewport';
import { ImportProgressModal } from './features/library/components/ImportProgressModal';
import { useLibraryStore } from './features/library/stores/useLibraryStore';
import { useLibrary } from './features/library/hooks/useLibrary';
import { useDirectoryScanner } from './features/library/hooks/useDirectoryScanner';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeComic, setActiveComic] = useState<StoredComic | null>(null);
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);
  const rawComics = useLibraryStore((state) => state.comics);

  const {
    allComicsCount,
    stats,
    importProgress,
    importFiles,
    toggleFavorite,
    deleteComic,
  } = useLibrary();

  const { isScanning, scanDirectory, pickFiles } =
    useDirectoryScanner(importFiles);

  const handleOpenComic = (comic: StoredComic) => {
    setActiveComic(comic);
  };

  const handleCloseReader = () => {
    setActiveComic(null);
    loadLibrary();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-150">
      {activeComic ? (
        <ReaderViewport comic={activeComic} onClose={handleCloseReader} />
      ) : (
        <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
          {/* Barra de navegación superior adaptativa */}
          <AppNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            totalComics={allComicsCount}
            onPickFiles={pickFiles}
            onScanDirectory={scanDirectory}
            isScanning={isScanning}
          />

          {/* Vistas Principales: Inicio (Dashboard) y Biblioteca */}
          <main className="w-full max-w-full overflow-x-hidden flex-1">
            {activeTab === 'home' ? (
              <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
                <HomeDashboard
                  comics={rawComics}
                  stats={stats}
                  onOpenComic={handleOpenComic}
                  onToggleFavorite={toggleFavorite}
                  onDeleteComic={deleteComic}
                  onPickFiles={pickFiles}
                  onScanDirectory={scanDirectory}
                  onGoToLibrary={() => setActiveTab('library')}
                />
              </div>
            ) : (
              <LibraryGrid
                onOpenComic={handleOpenComic}
                onPickFiles={pickFiles}
                onScanDirectory={scanDirectory}
                isScanning={isScanning}
              />
            )}
          </main>

          {/* Modal flotante global de progreso de importación */}
          {importProgress && <ImportProgressModal progress={importProgress} />}
        </div>
      )}
    </div>
  );
}

export default App;

