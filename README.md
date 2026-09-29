# Landing Page — Entrenador Personal

Landing page de alta conversión para un entrenador personal profesional.
HTML5 + CSS3 + JavaScript **sin dependencias externas**: no hay build, no hay
`node_modules`, no hay CDN. Se abre y funciona.

---

## Puesta en marcha

```bash
# Opción 1: con Node (no instala nada global)
npm start            # http://localhost:5173

# Opción 2: con Python
python -m http.server 5173

# Opción 3: abre index.html directamente (doble clic)
```

> Para `file://` funcionan el diseño, las animaciones y el formulario.
> Únicamente requieren servidor las pruebas CORS (p. ej. medir Lighthouse).

---

## Estructura

```
.
├── index.html              # Marcado semántico, SEO y datos estructurados
├── package.json            # Scripts de desarrollo (sin dependencias)
├── .gitignore
├── assets/
│   ├── css/
│   │   └── styles.css      # Design tokens + 18 secciones comentadas
│   ├── js/
│   │   └── main.js         # 11 módulos de interactividad
│   ├── img/
│   │   └── README.md       # Qué imágenes añadir y a qué tamaño
│   └── media/
│       └── README.md       # Vídeo de fondo del hero (opcional)
```

---

## Secciones de la página

| # | Sección          | ID           | Objetivo de conversión                        |
| - | ---------------- | ------------ | --------------------------------------------- |
| 1 | Header sticky    | `#inicio`    | Navegación + CTA siempre visible              |
| 2 | Hero             | —            | Titular de impacto + CTA primario             |
| 3 | Métricas         | `#metricas`  | Contadores animados con resultados reales      |
| 4 | Sobre mí         | `#sobre-mi`  | Autoridad: certificaciones y metodología       |
| 5 | Programas        | `#programas` | 3 tarjetas con precio en COP                  |
| 6 | Proceso          | `#proceso`   | Reduce la fricción: "3 pasos"                  |
| 7 | Testimonios      | `#testimonios` | Prueba social con resultados medibles       |
| 8 | FAQ              | `#faq`       | Responde objeciones antes del formulario       |
| 9 | Contacto         | `#contacto`  | Formulario de captación                       |
| 10 | Footer           | —            | Datos directos, redes y navegación            |

Elementos de conversión añadidos sobre el brief: barra CTA fija en móvil,
franja de garantía de 30 días, métricas animadas y bloque de proceso.

---

## Personalización

### 1. Colores y tipografía

Todo vive en el bloque de *design tokens* al inicio de `styles.css`:

```css
:root {
  --c-bg: #0a0a0c;          /* Fondo principal   */
  --c-surface: #14141b;     /* Tarjetas          */
  --c-accent: #e4ff3a;     /* Amarillo neón     */
  --c-accent-2: #ff5c1a;   /* Naranja           */
  --c-accent-3: #2de2e6;   /* Cian              */

  --fs-h1: clamp(2.5rem, 1.75rem + 3.6vw, 4.75rem);
  --ff-sans: "Segoe UI", system-ui, -apple-system, sans-serif;
}
```

Cambiar esos valores **repinta la página entera** de forma coherente.

> Todos los niveles de texto cumplen **WCAG AA (≥ 4.5:1)** sobre el fondo más
> oscuro. Si los cambias, vuelve a verificar el contraste.

### 2. Contenido

En `index.html` busca el comentario `[EDITAR]` y sustituye:

- Nombre, teléfono, correo y ciudad (header, contacto, footer).
- Precios en COP dentro de `.card__price`.
- Biografía, certificaciones y metodología.
- Textos de los testimonios y sus resultados medibles.
- Preguntas de la FAQ (**mantén sincronizado el JSON-LD**, ver abajo).

### 3. Imágenes

Consulta `assets/img/README.md`. Si un archivo no existe, la sección mantiene
su aspecto gracias al respaldo en CSS (degradado, monograma o ícono) y el
navegador no muestra iconos rotos.

### 4. Conectar el formulario

En `assets/js/main.js`, al principio del archivo:

```js
const CONFIG = {
  formEndpoint: 'https://tu-backend.com/leads',   // null = modo demostración
  draftKey: 'entrenador:lead-draft',
  heroVideo: '',                                   // p. ej. 'assets/media/hero-loop.mp4'
  counterDuration: 1600,
};
```

Con `formEndpoint` en `null` el formulario **simula** el envío (900 ms) y
muestra el panel de éxito: sirve para revisar el diseño sin backend.

Al conectarlo se envía `POST` en JSON con los campos del formulario. Ejemplos:

- **Formspree:** `formEndpoint: 'https://formspree.io/f/TU_ID'`
- **Web3Forms:** `formEndpoint: 'https://api.web3forms.com/submit'`
- **Tu API:** la misma llamada, con CORS habilitado.

Incluye: validación en vivo, mensajes de error accesibles (`role="alert"`),
`aria-invalid`, foco al primer campo con error, estado de carga, panel de
éxito, honeypot anti-spam y guardado de borrador en `localStorage`.

### 5. Analítica

Los elementos con `data-track="..."` disparan un evento. El gancho está en
`main.js` → función `track()`:

```js
function track(eventName, params = {}) {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });  // GTM
  }
  // Añade aquí GA4, Meta Pixel, TikTok Pixel…
}
```

Eventos actuales: `cta_hero`, `cta_about`, `plan_acondicionamiento`,
`plan_hipertrofia`, `plan_nutricion`, `dock_cta`, `dock_whatsapp`,
`contacto_whatsapp`, `contacto_email`, `social_*` y `lead_submitted`.

---

## Detalles técnicos

### Rendimiento

- **0 dependencias**: ni framework CSS, ni librería JS, ni fuentes externas.
- Un solo `request` de CSS y uno de JS (`defer`, no bloquea el renderizado).
- Tipografía del sistema: **0 descargas** y sin salto de fuente (FOUT).
- Íconos SVG en un *sprite* inline: **0 peticiones** de imágenes de iconos.
- Imágenes del hero en `srcset` (73 KB en móvil / 202 KB en escritorio).
- Las animaciones usan solo `transform` y `opacity` (compuestas por la GPU).
- Sin vídeo por defecto: la página pesa **~190 KB sin comprimir**.

### Accesibilidad

- Marcado semántico: `header` / `nav` / `main` / `section` / `article` / `footer`.
- Enlace de salto al contenido, `aria-label` en controles de sólo icono.
- Navegación por teclado completa, incluidos menú móvil y carrusel (← →).
- El estado inicial oculto de las animaciones **solo se aplica si hay JS**
  (clase `.js`), de modo que un fallo de JavaScript nunca oculta contenido.
- `prefers-reduced-motion` respetado en todo el documento.
- **Lighthouse: 100 / 100 / 100** (accesibilidad, buenas prácticas, SEO).

### SEO

- `title`, `meta description`, canonical y Open Graph listos.
- JSON-LD válido con `Person`, `ItemList`/`Service` y `FAQPage`
  (habilita los *rich results* de Google).
  > Si editas las preguntas de la FAQ, actualiza también el bloque
  > `<script type="application/ld+json">` para que no se contradigan.

### Responsive

Puntos de corte principales: `1024px`, `900px`, `720px`, `480px`.

- El carrusel de testimonios es una **cuadrícula de 3 columnas** en
  escritorio y un **carrusel con scroll-snap** en móvil.
- Los controles del carrusel solo aparecen cuando hay algo que desplazar.

---

## Módulos de `main.js`

Cada módulo es una función aislada: si uno falla, el resto sigue funcionando
(el error se registra en consola).

| Módulo            | Responsabilidad                                        |
| ----------------- | ------------------------------------------------------ |
| `initHeader`      | Estado sticky y barra de progreso de lectura            |
| `initNav`         | Menú móvil, scroll suave con offset, enlace activo      |
| `initReveal`      | Animaciones de entrada con `IntersectionObserver`       |
| `initCounters`    | Contadores animados con easing                          |
| `initCarousel`    | Siguiente/anterior, puntos, teclado, estado de botones  |
| `initHeroMedia`   | Imagen de respaldo y vídeo opcional del hero            |
| `initForm`        | Validación, envío, borrador y panel de éxito            |
| `initDock`        | Barra CTA fija de móvil                                |
| `initMisc`        | Año, preselección de plan, tracking, inclinación 3D     |
| `initAboutPhoto`  | Foto del entrenador o monograma de respaldo            |

---

## Antes de publicar

- [ ] Sustituir nombre, teléfono, correo, ciudad y redes sociales.
- [ ] Reemplazar los textos de ejemplo (biografía, testimonios, FAQ).
- [ ] Ajustar los **precios en COP** a los valores reales.
- [ ] Añadir `og-cover.jpg` (1200×630) y `favicon.svg`.
- [ ] Ideal: sustituir las imágenes por versiones **WebP/AVIF** (ahorra ~40 %).
- [ ] Configurar `formEndpoint` y probar el envío real.
- [ ] Actualizar `canonical`, `og:image` y los datos de contacto del JSON-LD.
- [ ] Añadir los enlaces reales de Política de privacidad y Términos.
- [ ] Verificar los datos estructurados en
      [search.google.com/test/rich-results](https://search.google.com/test/rich-results).
- [ ] Ejecutar Lighthouse en la URL de producción.

## Despliegue

Es un sitio estático: sirve la carpeta tal cual en Netlify, Vercel, GitHub
Pages, Cloudflare Pages o cualquier hosting con Apache/Nginx.

Si lo sirves desde un subdirectorio, ajusta las rutas relativas en
`index.html` y la `canonical` a la URL final.
