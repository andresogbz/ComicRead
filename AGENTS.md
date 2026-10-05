# Reglas del Proyecto ComicRead

1. **Diseño Sin Bordes (Borderless UI):**
   - No utilizar líneas de borde divisorias (`border`, `border-b`, `border-dashed`, etc.) en tarjetas, cabeceras, botones o modales. Usar contrastes suaves, esquinas redondeadas y desenfoques (*backdrop-blur*).

2. **Cero Fondos o Recuadros Detrás de Iconos:**
   - **Estrictamente Prohibido:** Colocar contenedores, recuadros, cuadrados redondeados o cajas con color o transparencia (`bg-primary/10`, `bg-black/5`, etc.) detrás de logos o iconos.
   - Los iconos deben aparecer limpios, directos y desnudos, integrados junto al texto o sobre el fondo del lienzo.

3. **Tarjetas Fusionadas con el Fondo (Seamless Cards):**
   - Las tarjetas de cómics deben tener `bg-transparent` sin contenedores ni fondos propios que creen cajas aisladas. La carátula y el texto flotan naturalmente sobre el fondo.

4. **Filtros Sin Scroll Horizontal:**
   - Las píldoras o controles de filtrado deben ajustarse con fluidez y elegancia sin provocar barras de scroll horizontal molestas.

5. **Modo Claro y Oscuro con Color Primario Dinámico:**
   - Todo componente debe adaptarse a modo oscuro y claro de forma fluida.
   - Los elementos de acento (botones principales, chips activos, barras de progreso, etc.) deben responder al color primario dinámico de `useThemeStore`.

6. **Prohibición Total de Emojis:**
   - Cero emojis en la interfaz de usuario (botones, títulos, insignias) y en el código.

7. **Pruebas a Cargo del Usuario:**
   - No ejecutar `browser_subagent` a menos que sea explícitamente solicitado por el usuario.
