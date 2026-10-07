import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

let currentIsDark = true;
let currentBgColor = '#0c0c0e';

export const statusBarService = {
  /**
   * Configura la barra de estado para que coincida exactamente con el fondo de la app
   * (blanco en modo claro, oscuro en modo oscuro, o color personalizado),
   * garantizando que tome el color real tanto en teléfonos como en tablets Huawei/Android.
   */
  async initAppTheme(isDark = true, bgColor = isDark ? '#0c0c0e' : '#ffffff'): Promise<void> {
    currentIsDark = isDark;
    currentBgColor = bgColor;
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({ color: bgColor });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo inicializar la barra de estado:', e);
    }
  },

  /**
   * Actualiza el contraste de iconos y el color exacto de la barra según el fondo seleccionado.
   */
  async updateStatusBarStyle(isDark: boolean, bgColor?: string): Promise<void> {
    currentIsDark = isDark;
    if (bgColor) {
      currentBgColor = bgColor;
    }
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({ color: currentBgColor });
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo actualizar el estilo de la barra:', e);
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
   * Restaura la barra de estado con el color y estilo actual al salir del lector.
   */
  async exitImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: currentIsDark ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: currentBgColor });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar la barra de estado:', e);
      }
    }
  },
};
