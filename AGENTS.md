# Reglas del Proyecto ComicRead (Modern Minimalist UI)

1. **Estilo y Profundidad (CERO SOMBRAS Y CERO BORDES/FONDOS EN CONTENEDORES - Seamless Canvas):**
   - Prohibido terminantemente el uso de sombras (`box-shadow`, `drop-shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`, etc.).
   - Prohibidos efectos de resplandor, brillos, neón o elementos futuristas (cero `blur-3xl`, cero ambient glow).
   - Prohibido encerrar secciones, métricas, tarjetas o paneles dentro de cajas con bordes o fondos propios (cero `border border-zinc-... rounded-... bg-zinc-...`).
   - El fondo del lienzo debe ser continuo y limpio.
   - Separar elementos y secciones mediante **separadores lineales ligeros** (líneas divisorias horizontales y verticales sutiles, estilo `border-b` / `border-r border-zinc-200 dark:border-zinc-800`) y generoso espacio en blanco (*negative space*).

2. **Adaptabilidad Móvil y CERO Scroll Horizontal:**
   - Prohibido el desbordamiento horizontal (`overflow-x-hidden` mandatorio en contenedores raíz).
   - En pantallas móviles (360px-400px), los botones y barras de navegación deben adaptarse fluidamente. Si un botón de acción no cabe con texto completo en la barra superior, debe mostrar únicamente su icono o colapsar de forma compacta para evitar ensanchar la pantalla.

3. **Paleta Restringida (Máximo 3-4 Colores):**
   - Lienzo base continuo (Blanco puro / Negro mate neutral).
   - Tipografía principal de alto contraste (Tinta / Blanco suave).
   - Gris neutro de soporte para separadores sutiles y textos secundarios.
   - Un único color de acento primario armónico. Prohibido usar arcoíris de colores dispersos.

4. **Iconografía Plana y Sin Fondos:**
   - Estrictamente prohibido colocar contenedores, recuadros, círculos o cajas con color/transparencia detrás de iconos.
   - Todos los iconos deben tener un color único y uniforme proveniente de la paleta estricta.

5. **Tipografía:**
   - Prohibido el uso de ALL CAPS con espaciado (`uppercase tracking-*`). Usar Sentence case o Title case.
   - Jerarquía visual construida mediante tamaño de fuente y peso (bold, black, medium), no con artificios.

6. **Secciones Hero y Estadísticas:**
   - Titulares de gran impacto con tipografía grande y audaz directamente sobre el lienzo, sin cajas contenedoras.
   - Métricas y datos separados por divisores verticales o espacio, nunca en cajitas individuales con bordes o fondos.

7. **Espaciado y Limpieza:**
   - Padding y márgenes generosos para que el diseño respire.
   - Cero clutter; eliminar cualquier elemento decorativo no esencial.

8. **Prohibición Total de Emojis:**
   - Cero emojis en interfaz y código.

9. **Pruebas a Cargo del Usuario:**
   - No ejecutar `browser_subagent` a menos que sea explícitamente solicitado por el usuario.
