import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const statusBarService = {
  /**
   * Configura la barra de estado del sistema para que se combine con la estética de la app (#0C0C0E),
   * eliminando el color gris por defecto y usando iconos claros.
   */
  async initAppTheme(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0C0C0E' });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo inicializar el tema de la barra de estado:', e);
    }
  },

  /**
   * Oculta la barra de estado completamente en el lector para ofrecer pantalla completa inmersiva real.
   */
  async enterImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.hide();
      } catch (e) {
        console.warn('[StatusBar] No se pudo ocultar la barra de estado:', e);
      }
    }
  },

  /**
   * Restaura la barra de estado al color de la app cuando se sale del lector de cómics o libros.
   */
  async exitImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0C0C0E' });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar la barra de estado:', e);
      }
    }
  },
};
