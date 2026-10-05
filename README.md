# ComicRead — Lector de Cómics de Alto Rendimiento

Una aplicación moderna y de alto rendimiento para la lectura de cómics digitales (.cbz, .cbr, webtoon) con arquitectura Clean Architecture, extracción multihilo en segundo plano y compatibilidad multiplataforma (Web y Android APK).

---

## Características Principales

- **Soporte de Formatos:**
  - `.cbz` / `.zip` (descompresión por streaming).
  - `.cbr` / `.rar` (motor WebAssembly de alto rendimiento con `node-unrar-js`).
  - Detección inteligente de Magic Bytes y ordenamiento alfanumérico natural de páginas (ej. 1, 2, 10, 100).
- **Procesamiento en Segundo Plano (Zero-Lag UI):**
  - Descompresión ejecutada al 100% en Web Workers dedicados (`archive.worker.ts`).
  - Transferencia *Zero-Copy* de buffers de memoria (`ArrayBuffer`).
- **Librería / Estantería:**
  - Persistencia local completa con IndexedDB (`Dexie.js`).
  - Escaneo automático de carpetas locales con File System Access API.
  - Zona de arrastrar y soltar (Drag & Drop) para archivos y carpetas.
  - Filtros dinámicos (*Todos*, *En progreso*, *No leídos*, *Completados*, *Favoritos*) y barra de búsqueda.
- **Motor del Visor (Reader):**
  - **Occidental (LTR):** Lectura estándar de izquierda a derecha.
  - **Manga (RTL):** Lectura japonesa de derecha a izquierda.
  - **Webtoon:** Scroll vertical continuo con carga bajo demanda (`IntersectionObserver`).
  - **Gestos táctiles completos:** Pinch-to-zoom (1.0x a 4.0x), swipe para pasar página, doble toque para zoom rápido y paneo en dos ejes.
  - **Pantalla completa inmersiva:** Fullscreen API nativa con auto-ocultamiento del HUD.
  - **Pre-fetching Predictivo:** Precarga en segundo plano de las siguientes 3 páginas y la anterior con evicción de memoria para evitar saturación de RAM.

---

## Descargar la App en Android (APK)

Puedes descargar el archivo instalador `.apk` directamente desde las [Releases de GitHub](https://github.com/andresogbz/ComicRead/releases):

1. Ve a la sección de **Releases** en este repositorio.
2. Descarga el archivo **`ComicRead.apk`** en tu teléfono Android.
3. Abre el archivo descargado para instalar la aplicación (asegúrate de habilitar la instalación de fuentes desconocidas si tu dispositivo lo solicita).

---

## Desarrollo Local

### Requisitos
- Node.js v20+ o v22+
- pnpm v10+

### Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev

# Compilar para producción
pnpm run build

# Sincronizar con Android
pnpm exec cap sync android
```
