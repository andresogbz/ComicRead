import { useState, useEffect, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import type { StoredComic } from './infrastructure/database/ComicDatabase';
import { AppNavigation } from './shared/components/AppNavigation';
import { FloatingBubbleMenu, type AppTab } from './shared/components/FloatingBubbleMenu';
import { HomeDashboard } from './features/home/components/HomeDashboard';
import { LibraryGrid } from './features/library/components/LibraryGrid';
import { AnalyticsView } from './features/analytics/components/AnalyticsView';
import { SettingsView } from './features/settings/components/SettingsView';
import { ReaderViewport } from './features/reader/components/ReaderViewport';
import { BookReaderViewport } from './features/bookReader/components/BookReaderViewport';
import { backupService } from './features/settings/services/backupService';
import { ImportProgressModal } from './features/library/components/ImportProgressModal';
import { SplashScreen } from './shared/components/SplashScreen';
import { useLibraryStore } from './features/library/stores/useLibraryStore';
import { useLibrary } from './features/library/hooks/useLibrary';
import { useDirectoryScanner } from './features/library/hooks/useDirectoryScanner';
import { statusBarService } from './shared/services/statusBarService';
import { useThemeStore, isDarkColor } from './core/theme/useThemeStore';

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

  const handleCloseReader = useCallback(() => {
    setActiveComic(null);
    loadLibrary();
  }, [loadLibrary]);

  // Recuperación automática e inicialización de la barra de estado
  useEffect(() => {
    const initApp = async () => {
      try {
        const { mode, customBgColor } = useThemeStore.getState();
        const effectiveBg = customBgColor || (mode === 'dark' ? '#0c0c0e' : '#ffffff');
        const isDark = isDarkColor(effectiveBg);
        await statusBarService.initAppTheme(isDark, effectiveBg);
      } catch (err) {
        console.warn('[App] Error al inicializar barra de estado:', err);
      }

      try {
        await backupService.checkAndRestoreOnFirstLaunch();
      } catch (err) {
        console.warn('[App] Error al verificar respaldo automático:', err);
      }

      try {
        await loadLibrary();
      } catch (err) {
        console.warn('[App] Error al cargar biblioteca:', err);
      }
    };
    initApp();
  }, [loadLibrary]);

  // Pantalla completa inmersiva (ocultar barra de estado al leer, restaurar al salir)
  useEffect(() => {
    if (activeComic) {
      statusBarService.enterImmersiveReader();
    } else {
      statusBarService.exitImmersiveReader();
    }
  }, [activeComic]);

  // Manejo del botón de hacia atrás físico / gestual en Android
  useEffect(() => {
    let backListener: { remove: () => void } | null = null;

    const setupListener = async () => {
      backListener = await CapApp.addListener('backButton', () => {
        // 1. Si el lector de cómics o libros está activo, regresar a la biblioteca sin cerrar la app
        if (activeComic) {
          handleCloseReader();
          return;
        }

        // 2. Si estamos en otra pestaña que no sea Inicio, volver a Inicio
        if (activeTab !== 'home') {
          setActiveTab('home');
          return;
        }

        // 3. Si ya estamos en la pantalla raíz de Inicio, permitir salir de la app
        CapApp.exitApp();
      });
    };

    setupListener();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [activeComic, activeTab, handleCloseReader]);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-150">
      {/* Fondo sólido continuo y limpio (Seamless Canvas para Edge-to-Edge status bar) */}
      <div className="fixed inset-0 z-0 bg-[var(--bg-main)] pointer-events-none transition-colors duration-200" />

      {/* Capa de contenido interactivo */}
      <div className="relative z-10 min-h-screen w-full max-w-full overflow-x-hidden">
        {activeComic ? (
          activeComic.format === 'epub' ||
          activeComic.format === 'txt' ||
          activeComic.mediaType === 'book' ? (
            <BookReaderViewport
              book={activeComic}
              onClose={handleCloseReader}
            />
          ) : (
            <ReaderViewport
              comic={activeComic}
              allComics={rawComics}
              onClose={handleCloseReader}
              onOpenComic={handleOpenComic}
            />
          )
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

        {/* Pantalla de bienvenida / Splash personalizada */}
        <SplashScreen />
      </div>
    </div>
  );
}

export default App;
