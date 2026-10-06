import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const statusBarService = {
  /**
   * Configura la barra de estado para que sea 100% transparente y superpuesta
   * sobre el lienzo de la app (Edge-to-Edge al estilo GitHub / Android moderno),
   * haciendo que adopte el color exacto del fondo de la aplicación.
   */
  async initAppTheme(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#00000000' });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo inicializar la barra de estado transparente:', e);
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
   * Restaura la barra de estado transparente y superpuesta cuando se sale del lector.
   */
  async exitImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#00000000' });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar la barra de estado:', e);
      }
    }
  },
};
