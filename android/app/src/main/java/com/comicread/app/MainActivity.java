package com.comicread.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();

        // Edge-to-Edge real (como Facebook): La app se dibuja de forma continua debajo de la barra de estado
        WindowCompat.setDecorFitsSystemWindows(window, false);

        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Deshabilitar la imposición forzada de contraste de EMUI/HarmonyOS/Android 10+
        // que dibuja máscaras grises en tablets Huawei
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(Color.TRANSPARENT);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        }
    }

    /**
     * Desactivar el menú flotante nativo de selección de texto de Android (Traducir, Copiar, Compartir)
     * para que no tape la pantalla ni compita con la barra de herramientas de ComicRead.
     */
    @Override
    public ActionMode onWindowStartingActionMode(ActionMode.Callback callback, int type) {
        if (type == ActionMode.TYPE_FLOATING) {
            return createDummyActionMode();
        }
        return super.onWindowStartingActionMode(callback, type);
    }

    @Override
    public ActionMode startActionMode(ActionMode.Callback callback, int type) {
        if (type == ActionMode.TYPE_FLOATING) {
            return createDummyActionMode();
        }
        return super.startActionMode(callback, type);
    }

    @Override
    public void onActionModeStarted(ActionMode mode) {
        if (mode != null && mode.getType() == ActionMode.TYPE_FLOATING) {
            mode.finish();
            return;
        }
        super.onActionModeStarted(mode);
    }

    private ActionMode createDummyActionMode() {
        return new ActionMode() {
            @Override public void setTitle(CharSequence title) {}
            @Override public void setTitle(int resId) {}
            @Override public void setSubtitle(CharSequence subtitle) {}
            @Override public void setSubtitle(int resId) {}
            @Override public void setCustomView(android.view.View view) {}
            @Override public void invalidate() {}
            @Override public void finish() {}
            @Override public Menu getMenu() {
                return new android.widget.PopupMenu(MainActivity.this, null).getMenu();
            }
            @Override public CharSequence getTitle() { return null; }
            @Override public CharSequence getSubtitle() { return null; }
            @Override public android.view.View getCustomView() { return null; }
            @Override public android.view.MenuInflater getMenuInflater() {
                return new android.view.MenuInflater(MainActivity.this);
            }
        };
    }
}
