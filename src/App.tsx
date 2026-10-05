import { useState, useMemo } from 'react';
import type { StoredComic } from './infrastructure/database/ComicDatabase';
import { AppNavigation } from './shared/components/AppNavigation';
import { FloatingBubbleMenu, type AppTab } from './shared/components/FloatingBubbleMenu';
import { HomeDashboard } from './features/home/components/HomeDashboard';
import { LibraryGrid } from './features/library/components/LibraryGrid';
import { AnalyticsView } from './features/analytics/components/AnalyticsView';
import { SettingsView } from './features/settings/components/SettingsView';
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

  // Portada destacada para el fondo global de toda la app
  const activeCoverUrl = useMemo(() => {
    if (activeComic?.coverDataUrl) return activeComic.coverDataUrl;
    if (rawComics.length === 0) return null;
    const inProgress = rawComics
      .filter((c) => c.progressPercentage > 0 && c.progressPercentage < 100 && c.coverDataUrl)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
    if (inProgress.length > 0) return inProgress[0].coverDataUrl;
    const withCover = rawComics.find((c) => !!c.coverDataUrl);
    return withCover?.coverDataUrl || null;
  }, [activeComic, rawComics]);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-[var(--text-main)] transition-colors duration-150">
      {/* Portada como fondo de absolutamente toda la aplicación */}
      {activeCoverUrl ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
        >
          <img
            src={activeCoverUrl}
            alt=""
            className="h-full w-full object-cover object-center scale-105 filter blur-[3px] transition-all duration-700 ease-out"
          />
          {/* Capas de gradiente y contraste para máxima legibilidad de alto contraste */}
          <div className="absolute inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-xs" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)]/90 via-transparent to-black/60" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-[var(--bg-main)] pointer-events-none" />
      )}

      {/* Capa de contenido interactivo */}
      <div className="relative z-10 min-h-screen w-full max-w-full overflow-x-hidden">
        {activeComic ? (
          <ReaderViewport comic={activeComic} onClose={handleCloseReader} />
        ) : (
          <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
            {/* Header minimalista y transparente */}
            <AppNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalComics={allComicsCount}
              onPickFiles={pickFiles}
              onScanDirectory={scanDirectory}
              isScanning={isScanning}
            />

            {/* Vistas Principales: Inicio, Biblioteca, Análisis y Configuración */}
            <main className="w-full max-w-full overflow-x-hidden flex-1">
              {activeTab === 'home' && (
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
              )}

              {activeTab === 'library' && (
                <LibraryGrid
                  onOpenComic={handleOpenComic}
                  onPickFiles={pickFiles}
                  onScanDirectory={scanDirectory}
                  isScanning={isScanning}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView stats={stats} comics={rawComics} />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  onPickFiles={pickFiles}
                  onScanDirectory={scanDirectory}
                  isScanning={isScanning}
                />
              )}
            </main>

            {/* Menú Flotante Inferior de Burbujas */}
            <FloatingBubbleMenu
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalComics={allComicsCount}
              onPickFiles={pickFiles}
            />

            {/* Modal flotante global de progreso de importación */}
            {importProgress && <ImportProgressModal progress={importProgress} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
