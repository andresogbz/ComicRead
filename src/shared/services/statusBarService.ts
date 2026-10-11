import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

let currentIsDark = true;
let currentBgColor = '#0c0c0e';

export const statusBarService = {
  /**
   * Configura la barra de estado con el color de fondo exacto de la aplicación
   * (blanco en tema claro, oscuro en tema oscuro o color personalizado) y el contraste
   * correcto de iconos (iconos negros en fondo claro, blancos en fondo oscuro).
   * Compatible con teléfonos y tablets Huawei / HarmonyOS.
   */
  async initAppTheme(isDark = true, bgColor?: string): Promise<void> {
    currentIsDark = isDark;
    currentBgColor = bgColor || (isDark ? '#0c0c0e' : '#ffffff');

    if (!Capacitor.isNativePlatform()) return;

    // 1. Intentar overlay para dibujo continuo Edge-to-Edge
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
    } catch (e) {
      console.warn('[StatusBar] No se pudo configurar overlay:', e);
    }

    // 2. Establecer el color real de fondo (en tablets Huawei evita la barra negra)
    try {
      await StatusBar.setBackgroundColor({ color: currentBgColor });
    } catch (e) {
      console.warn('[StatusBar] No se pudo establecer color de fondo:', e);
    }

    // 3. Establecer el contraste de los iconos (Style.Light = iconos oscuros para fondo claro)
    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch (e) {
      console.warn('[StatusBar] No se pudo establecer estilo de iconos:', e);
    }

    // 4. Asegurar visibilidad de la barra
    try {
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo mostrar barra:', e);
    }
  },

  /**
   * Actualiza el color de fondo y el contraste de los iconos de la barra según el tema.
   */
  async updateStatusBarStyle(isDark: boolean, bgColor?: string): Promise<void> {
    currentIsDark = isDark;
    currentBgColor = bgColor || (isDark ? '#0c0c0e' : '#ffffff');

    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
    } catch (e) {
      console.warn('[StatusBar] No se pudo configurar overlay:', e);
    }

    try {
      await StatusBar.setBackgroundColor({ color: currentBgColor });
    } catch (e) {
      console.warn('[StatusBar] No se pudo actualizar color de fondo:', e);
    }

    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch (e) {
      console.warn('[StatusBar] No se pudo actualizar estilo de iconos:', e);
    }

    try {
      await StatusBar.show();
    } catch (e) {
      console.warn('[StatusBar] No se pudo mostrar barra:', e);
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
   * Restaura la barra de estado con el color y estilo correspondientes al salir del lector.
   */
  async exitImmersiveReader(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
      } catch (e) {
        console.warn('[StatusBar] No se pudo mostrar barra al salir de inmersión:', e);
      }

      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {
        console.warn('[StatusBar] No se pudo configurar overlay al salir:', e);
      }

      try {
        await StatusBar.setBackgroundColor({ color: currentBgColor });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar color de fondo:', e);
      }

      try {
        await StatusBar.setStyle({ style: currentIsDark ? Style.Dark : Style.Light });
      } catch (e) {
        console.warn('[StatusBar] No se pudo restaurar estilo de iconos:', e);
      }
    }
  },
};
