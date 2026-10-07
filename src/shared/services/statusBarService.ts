import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

let currentIsDark = true;

export const statusBarService = {
  /**
   * Configura la barra de estado 100% transparente sobre la app (Edge-to-Edge, estilo Facebook),
   * asegurando que la app sea continua y los iconos contrasten (oscuros en fondo claro, claros en fondo oscuro).
   */
  async initAppTheme(isDark = true, _bgColor?: string): Promise<void> {
    currentIsDark = isDark;
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({ color: '#00000000' });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo inicializar la barra de estado:', e);
    }
  },

  /**
   * Actualiza el contraste de los iconos sobre la barra transparente según el tema claro u oscuro.
   */
  async updateStatusBarStyle(isDark: boolean, _bgColor?: string): Promise<void> {
    currentIsDark = isDark;
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({ color: '#00000000' });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo actualizar el estilo de la barra:', e);
    }
  },

  /**
   * Oculta la barra de estado en el lector para ofrecer pantalla completa inmersiva real.
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
   * Restaura la barra de estado transparente y el contraste de iconos al salir del lector.
   */
  async exitImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setBackgroundColor({ color: '#00000000' });
        await StatusBar.setStyle({ style: currentIsDark ? Style.Dark : Style.Light });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar la barra de estado:', e);
      }
    }
  },
};
